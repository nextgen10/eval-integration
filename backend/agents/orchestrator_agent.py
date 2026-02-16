import asyncio
import os
import json
from typing import Dict, Any, List, Callable, Optional
from datetime import datetime

from .base_agent import BaseAgent
from .consistency_agent import ConsistencyAgent
from .target_agent import TargetAgent
from .json_evaluator_agent import JsonEvaluatorAgent
from agent_models import (
    TestRequest, OutputDetail, AgentStatus, 
    AggregateMetrics, ErrorSummary, BatchTestResult, QueryResult
)

class OrchestratorAgent(BaseAgent):
    def __init__(self, event_callback: Optional[Callable[[AgentStatus], None]] = None, model_name: str = "all-MiniLM-L12-v2"):
        super().__init__(name="Orchestrator Agent")
        self.event_callback = event_callback
        self.model_name = model_name
        
        # Initialize Sub-Agents
        self.target_agent = TargetAgent()
        self.consistency_agent = ConsistencyAgent(model_name=model_name)
        self.json_evaluator = JsonEvaluatorAgent(model_name=model_name)
        
        # Lazy load Metric Agents to save startup memory
        from .metric_agents import (
            ExactMatchAgent, SemanticSimilarityAgent, SafetyAgent, LLMJudgeAgent
        )
        from agent_convert_json import unflatten_json
        self.unflatten_json = unflatten_json

        self.metric_agents = {
            "exact": ExactMatchAgent(),
            "semantic": SemanticSimilarityAgent(model_name=model_name),
            "safety": SafetyAgent(),
            "llm_judge": LLMJudgeAgent()
        }

    async def run(self, input_data: Any) -> Any:
        """
        Implementation of abstract run method.
        Routes to run_batch or run_single_test based on input type.
        """
        if isinstance(input_data, list):
            return await self.run_batch(input_data)
        elif isinstance(input_data, TestRequest):
            return await self.run_single_test(input_data)
        else:
            raise ValueError("Input must be TestRequest or List[TestRequest]")

    async def emit_status(self, agent_name: str, status: str, message: str, details: Dict[str, Any] = None):
        if self.event_callback:
            event = AgentStatus(
                agent_name=agent_name,
                status=status,
                message=message,
                details=details
            )
            await self.event_callback(event)
    
    async def _run_metric_agent(self, agent_key: str, input_data: Any) -> Any:
        agent = self.metric_agents[agent_key]
        await self.emit_status(agent.name, "working", f"Calculating {agent.name}...")
        try:
            result = await agent.run(input_data)
            score = result.get("score", 0.0)
            msg = f"{agent.name} finished (Score: {score:.2f})"
            
            await self.emit_status(agent.name, "completed", msg, details=result)
            return result
        except Exception as e:
            await self.emit_status(agent.name, "failed", f"{agent.name} failed: {str(e)}")
            return {"score": 0.0}

    async def run_batch_test(
        self, 
        requests: List[TestRequest],
        accuracy_threshold: float = 0.5,
        consistency_threshold: float = 0.5,
        hallucination_threshold: float = 0.5,
        rqs_threshold: float = 0.5,
        alpha: float = 0.6,
        beta: float = 0.2,
        gamma: float = 0.2,
        w_accuracy: float = 0.45,
        w_completeness: float = 0.25,
        w_hallucination: float = 0.15,
        w_safety: float = 0.15,
        aggregate_run_metrics: bool = True
    ) -> BatchTestResult:
        await self.emit_status("Orchestrator", "working", f"Starting batch evaluation of {len(requests)} queries")
        
        per_query = {}
        accuracy_per_query = {}
        consistency_per_query = {}
        
        total_accuracy = 0.0
        hallucinations = 0
        corrects = 0
        
        fail_reasons = []

        # Capture original flags before we potentially clear them in the loop
        any_safety_enabled = any(r.enable_safety for r in requests)

        for req in requests:
            if req.ground_truth:
                query_id = req.ground_truth.query_id
            else:
                query_id = f"q{len(per_query) + 1}"
                
            await self.emit_status("Orchestrator", "working", f"Processing Query {query_id}")
            
            # If doing aggregate run metrics, disable per-field expensive checks
            if aggregate_run_metrics:
                # We save original state in variables above, so we can clear here to avoid redundant field calls
                req.enable_safety = False

            output_detail = await self.run_single_test(req, query_id)
            
            if query_id not in per_query:
                per_query[query_id] = QueryResult(outputs=[], n_runs=0)
                accuracy_per_query[query_id] = 0.0
                consistency_per_query[query_id] = 0.0
            
            per_query[query_id].outputs.append(output_detail)
            per_query[query_id].n_runs += 1
            
            current_acc = accuracy_per_query[query_id]
            n = per_query[query_id].n_runs
            accuracy_per_query[query_id] = ((current_acc * (n - 1)) + output_detail.accuracy) / n
            
        total_accuracy = sum(accuracy_per_query.values())
        
        # --- NEW: Run Level Aggregate Metrics ---
        run_details = {}
        if aggregate_run_metrics:
            # 1. Group by Run ID
            runs_data = {} # run_id -> { aio_dict: {}, gt_dict: {}, outputs: [] }
            for qid, qres in per_query.items():
                for out in qres.outputs:
                    rid = out.run_id
                    if rid not in runs_data:
                        runs_data[rid] = {"aio": {}, "gt": {}, "outputs": []}
                    runs_data[rid]["aio"][qid] = out.output
                    runs_data[rid]["gt"][qid] = out.expected
                    runs_data[rid]["outputs"].append(out)

            # 2. Evaluate each run
            for rid, data in runs_data.items():
                await self.emit_status("Orchestrator", "working", f"Calculating Run-Level Metrics for {rid}")
                
                # Reconstruct JSON/Text
                try:
                    # Unflatten to restore original structure if possible
                    unflattened_aio = self.unflatten_json(data["aio"])
                    unflattened_gt = self.unflatten_json(data["gt"])
                    aio_text = json.dumps(unflattened_aio, indent=2)
                    gt_text = json.dumps(unflattened_gt, indent=2)
                except Exception as e:
                    print(f"DEBUG: Unflattening failed: {e}")
                    aio_text = json.dumps(data["aio"], indent=2)
                    gt_text = json.dumps(data["gt"], indent=2)

                # Safety Check (Unified Toxicity + LLM Judge for safety)
                safe_res = {"score": 1.0, "issues": []}
                llm_judge_res = {}
                
                if any_safety_enabled:
                    print(f"DEBUG: Triggering run-level safety check for {rid}...")
                    
                    # 1. Toxicity Check
                    safe_res = await self._run_metric_agent("safety", {"text": aio_text})
                    
                    # 2. LLM Judge Check
                    # Calculate average accuracy for this run to give context to judge
                    run_accuracies = [o.accuracy for o in data["outputs"]]
                    avg_run_acc = sum(run_accuracies) / len(run_accuracies) if run_accuracies else 0.0
                    
                    metrics_for_judge = {
                        "accuracy": avg_run_acc,
                        "toxicity": 1.0 - safe_res.get("score", 1.0),
                        "match_type": "json_aggregate"
                    }
                    
                    print(f"DEBUG: Triggering run-level LLM Judge for {rid}...")
                    llm_judge_res = await self._run_metric_agent("llm_judge", {
                        "candidate": aio_text,
                        "reference": gt_text,
                        "metrics": metrics_for_judge
                    })
                    print(f"DEBUG: Aggregate Safety/LLM Result for {rid}: Safety={safe_res.get('score')}, LLM={llm_judge_res.get('score')}")
                
                run_details[rid] = {
                    "safety_score": safe_res.get("score", 1.0),
                    "safety_issues": safe_res.get("issues", []),
                    "llm_score": llm_judge_res.get("score"),
                    "llm_explanation": llm_judge_res.get("reason"),
                    "reconstructed_aio": aio_text,
                    "reconstructed_gt": gt_text
                }

                # Back-populate to OutputDetail for UI compatibility
                # We apply the aggregate run-level score to all items in the run
                for out in data["outputs"]:
                    out.safety_score = safe_res.get("score", 1.0)
                    out.toxicity = 1.0 - safe_res.get("score", 1.0)
                    out.toxicity_issues = safe_res.get("issues", [])
                    out.llm_score = llm_judge_res.get("score")
                    out.llm_explanation = llm_judge_res.get("reason")
        
        for query_id in per_query:
            all_outputs_text = [o.output for o in per_query[query_id].outputs]
            cons_res = await self.consistency_agent.run({"outputs": all_outputs_text})
            
            await self.emit_status("Consistency Agent", "completed", "Consistency check done")
            cons_score = cons_res.get("score", 0.0)
            
            consistency_per_query[query_id] = cons_score
            
            for out in per_query[query_id].outputs:
                if out.error_type == "hallucination":
                    hallucinations += 1
                elif out.error_type == "correct":
                    corrects += 1
                
        n_queries = len(per_query)
        avg_acc = total_accuracy / n_queries if n_queries > 0 else 0.0
        
        total_consistency = sum(consistency_per_query.values())
        avg_cons = total_consistency / n_queries if n_queries > 0 else 0.0

        total_completeness = 0.0
        total_hallucination = 0.0
        total_safety = 0.0
        total_outputs_count = 0
        
        for qid, qres in per_query.items():
            for out in qres.outputs:
                total_outputs_count += 1
                total_completeness += getattr(out, 'completeness', 0.0)
                total_hallucination += getattr(out, 'hallucination', 0.0)
                total_safety += getattr(out, 'safety_score', 1.0)
        
        avg_completeness = total_completeness / total_outputs_count if total_outputs_count > 0 else 0.0
        avg_hallucination = total_hallucination / total_outputs_count if total_outputs_count > 0 else 0.0
        avg_safety = total_safety / total_outputs_count if total_outputs_count > 0 else 1.0

        agg = AggregateMetrics(
            accuracy=avg_acc,
            consistency=avg_cons,
            completeness=avg_completeness,
            hallucination=avg_hallucination,
            safety=avg_safety,
            rqs=rqs,
            alpha=alpha, beta=beta, gamma=gamma,
            n_queries=n_queries
        )
        
        err_summary = ErrorSummary(hallucination=hallucinations, correct=corrects)
        passed = True
        
        if avg_acc < accuracy_threshold:
            passed = False
            fail_reasons.append(f"Accuracy {avg_acc:.2f} < Threshold {accuracy_threshold}")
            
        if avg_cons < consistency_threshold:
            passed = False
            fail_reasons.append(f"Consistency {avg_cons:.2f} < Threshold {consistency_threshold}")
            
        if rqs < rqs_threshold:
            passed = False
            fail_reasons.append(f"RQS {rqs:.2f} < Threshold {rqs_threshold}")
            
        hallucination_rate = hallucinations / total_outputs if total_outputs > 0 else 0.0
        
        if hallucination_rate > hallucination_threshold:
            passed = False
            fail_reasons.append(f"Hallucination Rate {hallucination_rate:.2f} > Threshold {hallucination_threshold}")
        
        await self.emit_status("Orchestrator", "completed", " Evaluation finished")
        
        return BatchTestResult(
            per_query=per_query,
            accuracy_per_query=accuracy_per_query,
            consistency_per_query=consistency_per_query,
            aggregate=agg,
            error_summary=err_summary,
            evaluation_status="PASS" if passed else "FAIL",
            fail_reasons=fail_reasons,
            run_details=run_details
        )

    async def run_single_test(self, request: TestRequest, query_id: str = "q1") -> OutputDetail:
        # 1. Get Target Output
        target_output = None
        found = True
        
        if request.pre_computed_output is not None:
            await self.emit_status("Target Agent", "working", "Using pre-computed output...")
            target_output = request.pre_computed_output
            await self.emit_status("Target Agent", "completed", "Output loaded")
        elif request.input_prompt:
            await self.emit_status("Target Agent", "working", f"Generating output for: {request.input_prompt[:30]}...")
            target_output = await self.target_agent.run(request.input_prompt)
            await self.emit_status("Target Agent", "completed", "Output generated")
        else:
            # Static evaluation but field is missing
            found = False
            target_output = ""
            await self.emit_status("Target Agent", "failed", "Field missing in output (static eval)")
        
        # Convert to string if dict/list
        if isinstance(target_output, (dict, list)):
            target_output_str = json.dumps(target_output)
        else:
            target_output_str = str(target_output)
        
        # 2. Determine Expected Output & Match Type
        expected_text = request.expected_output or ""
        match_type = "text"
        if request.ground_truth:
            expected_text = request.ground_truth.expected
            match_type = request.ground_truth.expected_type
        
        # 3. Run Metric Agents in Parallel
        sem_res = {"score": 0.0}
        tox_res = {"score": 1.0, "issues": []}
        
        if found:
            await self.emit_status("Orchestrator", "working", "Dispatching to metric agents")
            tasks = []
            
            # Semantic always runs if found
            tasks.append(self._run_metric_agent("semantic", {"candidate": target_output_str, "reference": expected_text}))
            
            # Safety only if enabled for this query
            if request.enable_safety:
                tasks.append(self._run_metric_agent("safety", {"text": target_output_str}))
            
            results = await asyncio.gather(*tasks)
            sem_res = results[0]
            if request.enable_safety:
                tox_res = results[1]
        
        # 4. Accuracy Logic
        accuracy = 0.0
        if not found:
            accuracy = 0.0
        elif match_type in ["email", "number", "date", "exact"]:
            agent_match_type = "text" if match_type == "exact" else match_type
            exact_res = await self._run_metric_agent("exact", {
                "candidate": target_output_str, 
                "reference": expected_text,
                "match_type": agent_match_type
            })
            accuracy = exact_res["score"]
        else:
            normalized_expected = ' '.join(expected_text.split())
            normalized_output = ' '.join(target_output_str.split())
            
            if normalized_expected.lower() == normalized_output.lower():
                accuracy = 1.0
            elif sem_res.get("score") is not None and sem_res["score"] > request.semantic_threshold:
                accuracy = 1.0
        
        # 5. LLM Judge - META JUDGE
        llm_judge_score = None
        judge_res = {}
        if found and request.enable_safety:
            # Send all scores to judge
            metrics_for_judge = {
                "accuracy": accuracy,
                "semantic_score": sem_res.get("score", 0.0),
                "toxicity": tox_res.get("score", 0.0),
                "match_type": match_type
            }
            judge_res = await self._run_metric_agent("llm_judge", {
                "candidate": target_output_str,
                "reference": expected_text,
                "metrics": metrics_for_judge
            })
            llm_judge_score = judge_res.get("score")
            
            if llm_judge_score is not None and llm_judge_score >= request.llm_threshold:
                 accuracy = 1.0

        # 6. JSON Specific detailed evaluation
        json_meta = {
            "gt_keys": [query_id] if request.ground_truth else [],
            "aio_keys": [query_id] if found else [],
            "missing_keys": [query_id] if (request.ground_truth and not found) else [],
            "extra_keys": [query_id] if (found and not request.ground_truth) else []
        }
        
        if match_type == "json" and found:
            try:
                import json as json_lib
                from agent_models_json import JsonEvalConfig
                
                gt_dict = json_lib.loads(expected_text)
                aio_dict = json_lib.loads(target_output_str)
                
                json_config = JsonEvalConfig(
                    semantic_threshold=request.semantic_threshold,
                    fuzzy_threshold=request.fuzzy_threshold,
                    short_text_length=request.short_text_length,
                    w_accuracy=request.w_accuracy,
                    w_completeness=request.w_completeness,
                    w_hallucination=request.w_hallucination,
                    w_safety=request.w_safety,
                    model_name=self.model_name,
                    enable_safety=request.enable_safety,
                    llm_api_key=os.getenv("OPENAI_API_KEY") or os.getenv("AZURE_OPENAI_API_KEY")
                )
                
                json_res = await self.json_evaluator.evaluate_single(gt_dict, aio_dict, json_config)
                
                accuracy = json_res.accuracy
                
                json_meta = {
                    "completeness": json_res.completeness,
                    "hallucination": json_res.hallucination,
                    "rqs": json_res.rqs,
                    "gt_keys": json_res.gt_keys,
                    "aio_keys": json_res.aio_keys,
                    "extra_keys": json_res.extra_keys,
                    "missing_keys": json_res.missing_keys,
                    "field_scores": {k: v.model_dump() for k, v in zip(json_res.matching_keys, json_res.field_scores)},
                    "safety_score": json_res.safety_score,
                    "toxic_issues": [f"Tone: {json_res.tone}"],
                    "reason": f"Structure: {len(json_res.matching_keys)}/{len(json_res.gt_keys)} matched. Acc: {json_res.accuracy:.2f}"
                }
            except Exception as e:
                print(f"DEBUG: Json metadata extraction failed: {e}")
        elif found:
            # Use full query_id path as display field to preserve context
            display_field = query_id
            if request.ground_truth and request.ground_truth.metadata.get("column"):
                display_field = request.ground_truth.metadata["column"]

            strategy = "SEMANTIC" if match_type in ["text", "paragraph", "context"] else "EXACT"
            json_meta["field_scores"] = {
                display_field: {
                    "match_strategy": strategy,
                    "similarity": sem_res.get("score", 0.0),
                    "score": accuracy,
                    "gt_value": expected_text,
                    "aio_value": target_output_str
                }
            }
        
        await self.emit_status("Orchestrator", "completed", f"Finished Query {query_id}")

        return OutputDetail(
            found=found,
            match_type=match_type,
            accuracy=accuracy,
            expected=expected_text,
            output=target_output_str,
            run_id=request.run_id or "r1",
            safety_score=json_meta.get("safety_score", tox_res.get("score", 1.0)),
            toxicity=1.0 - json_meta.get("safety_score", tox_res.get("score", 1.0)),
            error_type="correct" if accuracy == 1.0 else "hallucination",
            semantic_score=sem_res.get("score"),
            llm_score=llm_judge_score,
            completeness=json_meta.get("completeness", 1.0 if found else 0.0),
            hallucination=json_meta.get("hallucination", 1.0 if (found and not request.ground_truth) else 0.0),
            rqs=json_meta.get("rqs", accuracy),
            gt_keys=json_meta.get("gt_keys"),
            aio_keys=json_meta.get("aio_keys"),
            extra_keys=json_meta.get("extra_keys"),
            missing_keys=json_meta.get("missing_keys"),
            field_scores=json_meta.get("field_scores"),
            reason=json_meta.get("reason") or (
                "Field missing" if not found else
                f"LLM Judge approved (Reason: {judge_res.get('reason')})" if llm_judge_score and llm_judge_score >= request.llm_threshold else
                "Exact string match" if accuracy == 1.0 and match_type in ["text", "exact"] else
                f"High semantic similarity ({sem_res.get('score'):.3f} > {request.semantic_threshold})" if accuracy == 1.0 and match_type in ["text", "paragraph"] else
                f"Low semantic similarity ({sem_res.get('score', 0.0):.3f} <= {request.semantic_threshold})" if accuracy < 1.0 and match_type in ["text", "paragraph"] else
                f"Success ({match_type} match)" if accuracy == 1.0 else f"Failed {match_type} comparison"
            ),
            toxicity_issues=json_meta.get("toxic_issues", tox_res.get("issues")),
            llm_explanation=judge_res.get("reason") if request.enable_safety else None
        )
