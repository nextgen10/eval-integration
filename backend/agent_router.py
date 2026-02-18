from fastapi import APIRouter, HTTPException, Request, BackgroundTasks
from fastapi.responses import StreamingResponse
from typing import List, Dict, Any, Optional
import os
import json
import asyncio
import uuid
from datetime import datetime

from agent_models import (
    TestRequest, BatchTestResult, OutputDetail, QueryResult, 
    AggregateMetrics, ErrorSummary, AgentStatus, JsonEvaluationRequest, 
    BatchPathRequest, GroundTruthRecord, FeedbackRequest
)
from agent_models_json import (
    JsonEvalConfig, JsonEvalResult, JsonEvalRequest, 
    JsonBatchEvalRequest, JsonBatchEvalResponse
)
from agents.orchestrator_agent import OrchestratorAgent
# from agents.json_evaluator_agent import JsonEvaluatorAgent # Imported inside orchestrator?
from agent_convert_json import flatten_json, convert_to_expected_format, convert_to_actual_format, safe_json_dumps

from agent_database import init_db, save_result, get_latest_result, save_feedback, get_all_feedback, get_all_results

# Initialize DB (might want to do this at startup)
init_db()

router = APIRouter(prefix="/agent-eval", tags=["Agent Evaluation"])

# Global event manager for SSE broadcasting
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[asyncio.Queue] = []

    async def connect(self):
        queue = asyncio.Queue()
        self.active_connections.append(queue)
        return queue

    def disconnect(self, queue: asyncio.Queue):
        if queue in self.active_connections:
            self.active_connections.remove(queue)

    async def broadcast(self, event: AgentStatus):
        for queue in self.active_connections:
            await queue.put(event)

manager = ConnectionManager()

async def event_generator(request: Request):
    queue = await manager.connect()
    try:
        while True:
            # Check if client disconnected
            if await request.is_disconnected():
                break
                
            # Wait for new events
            event = await queue.get()
            # Handle both AgentStatus objects and plain dicts
            if isinstance(event, dict):
                import json
                event_data = json.dumps(event)
            else:
                event_data = event.model_dump_json() # Pydantic v2 use model_dump_json
            # Yield event as SSE format
            yield f"data: {event_data}\n\n"
    finally:
        manager.disconnect(queue)

@router.get("/events")
async def sse_endpoint(request: Request):
    """
    Server-Sent Events endpoint to stream agent status updates.
    """
    return StreamingResponse(event_generator(request), media_type="text/event-stream")

@router.get("/latest-result")
async def get_latest_evaluation_endpoint():
    """Get the latest evaluation result from the database."""
    result = get_latest_result()
    if not result:
        return {"message": "No evaluations found"}
    return result

@router.get("/history")
async def get_history_endpoint():
    """Get historical evaluation results."""
    results = get_all_results()
    return results

# Helper: Ensure value is string (serialize dict/list if needed)
def ensure_string(value: Any) -> str:
    if value is None:
        return ""
    if isinstance(value, (dict, list)):
        return safe_json_dumps(value)
    if isinstance(value, str):
        return value
    return str(value)

from pydantic import BaseModel
class ConvertRequestModel(BaseModel):
    data: Any
    mode: str  # 'gt' or 'ai'
    run_id: str = "manual_run"

@router.post("/run-batch", response_model=BatchTestResult)
async def run_batch(requests: List[TestRequest]):
    # Generate run_id early
    run_id = str(uuid.uuid4())
    
    # Capture events locally for persistence
    events_log = []
    
    async def event_callback(event: AgentStatus):
        # 1. Push to SSE
        await manager.broadcast(event)
        # 2. Append to local log
        events_log.append(event.model_dump(mode='json'))

    # Initialize Orchestrator
    model_name = requests[0].model_name if requests else "all-MiniLM-L12-v2"
    orchestrator = OrchestratorAgent(event_callback=event_callback, model_name=model_name)
    
    try:
        result = await orchestrator.run_batch_test(requests) # run_batch calls run_batch_test internally in Orchestrator?
        # Wait, OrchestratorAgent.run_batch calls run_batch_test?
        # In original main.py: await orchestrator.run_batch(requests)
        # Let's check OrchestratorAgent.run_batch vs run_batch_test.
        # OrchestratorAgent.run delegates to run_batch if list.
        # But run_batch_test is the method with parameters.
        # The main.py call was: result = await orchestrator.run_batch(requests)
        
        # Save results to DB with events
        result.run_id = run_id
        new_id = save_result(result.model_dump_json(), json.dumps(events_log), run_id=run_id)
        result.id = new_id
            
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        error_event = AgentStatus(
            agent_name="System",
            status="failed",
            message=f"Batch execution failed: {str(e)}"
        )
        await event_callback(error_event)
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/convert-json")
async def convert_json_endpoint(request: ConvertRequestModel):
    try:
        data = request.data
        mode = request.mode

        # 1. Check if already normalized
        if isinstance(data, list) and len(data) > 0:
            first = data[0]
            if isinstance(first, dict):
                if mode == "gt" and "query_id" in first:
                    existing_output_key = next((k for k in ["expected_output", "output", "expected"] if k in first), None)
                    if existing_output_key:
                        standardized = []
                        for item in data:
                            standardized.append({
                                "query_id": str(item.get("query_id", "")),
                                "expected_output": ensure_string(item.get(existing_output_key, "")),
                                "type": str(item.get("type") or item.get("match_type") or "text"),
                                "source_field": str(item.get("source_field") or existing_output_key)
                            })
                        return standardized
                
                if mode == "ai" and "query_id" in first:
                    existing_output_key = next((k for k in ["actual_output", "output", "prediction"] if k in first), None)
                    if existing_output_key:
                        standardized = []
                        for item in data:
                            standardized.append({
                                "query_id": str(item.get("query_id", "")),
                                "actual_output": ensure_string(item.get(existing_output_key, "")),
                                "run_id": str(item.get("run_id") or request.run_id or "manual_run")
                            })
                        return standardized
        
        # 2. Perform Normalization
        flat = flatten_json(data)
        
        if mode == "gt":
            return convert_to_expected_format(flat)
        else:
            return convert_to_actual_format(flat, run_id=request.run_id)

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Conversion failed: {str(e)}")

@router.post("/evaluate-from-json", response_model=BatchTestResult)
async def evaluate_from_json(request: JsonEvaluationRequest):
    run_id = str(uuid.uuid4())
    events_log = []
    
    async def event_callback(event: AgentStatus):
        await manager.broadcast(event)
        events_log.append(event.model_dump(mode='json'))

    orchestrator = OrchestratorAgent(event_callback=event_callback, model_name=request.model_name)
    
    test_requests = []
    gt_map = {}
    for item in request.ground_truth:
        qid = str(item.get(request.gt_query_id_key, ""))
        if qid:
            gt_map[qid] = GroundTruthRecord(
                query_id=qid,
                expected=ensure_string(item.get(request.gt_expected_key, "")),
                expected_type=str(item.get(request.gt_type_key, "text")),
                metadata={"column": str(item.get("source_field") or request.gt_expected_key)}
            )
            
    found_gt_keys = set()
    for item in request.ai_outputs:
        qid = str(item.get(request.pred_query_id_key, ""))
        if qid:
            gt_record = gt_map.get(qid)
            if gt_record:
                found_gt_keys.add(qid)
            
            req = TestRequest(
                input_prompt="", 
                pre_computed_output=ensure_string(item.get(request.pred_output_key, "")),
                ground_truth=gt_record,
                run_id=str(item.get(request.pred_run_id_key, "r1")),
                semantic_threshold=request.semantic_threshold,
                model_name=request.model_name,
                enable_safety=request.enable_safety,
                llm_model_name=request.llm_model_name,
                llm_threshold=request.llm_threshold,
                fuzzy_threshold=request.fuzzy_threshold,
                short_text_length=request.short_text_length,
            )
            test_requests.append(req)

    for qid, gt_record in gt_map.items():
        if qid not in found_gt_keys:
            req = TestRequest(
                input_prompt="", 
                pre_computed_output=None, 
                ground_truth=gt_record,
                run_id="manual_run",
                semantic_threshold=request.semantic_threshold,
                model_name=request.model_name,
                enable_safety=request.enable_safety,
                llm_model_name=request.llm_model_name,
                llm_threshold=request.llm_threshold,
                fuzzy_threshold=request.fuzzy_threshold,
                short_text_length=request.short_text_length,
            )
            test_requests.append(req)

    try:
        result = await orchestrator.run_batch_test(
            test_requests,
            accuracy_threshold=request.accuracy_threshold,
            consistency_threshold=request.consistency_threshold,
            hallucination_threshold=request.hallucination_threshold,
            rqs_threshold=request.rqs_threshold,
            alpha=request.alpha,
            beta=request.beta,
            gamma=request.gamma,
            w_accuracy=request.w_accuracy,
            w_completeness=request.w_completeness,
            w_hallucination=request.w_hallucination,
            w_safety=request.w_safety,
            aggregate_run_metrics=True
        )
        
        result.run_id = run_id
        result.evaluation_method = "JSON"
        
        result.normalized_ground_truth = [
            {
                "query_id": item.get(request.gt_query_id_key, ""),
                "expected_output": ensure_string(item.get(request.gt_expected_key, "")),
                "match_type": str(item.get(request.gt_type_key, "text"))
            }
            for item in request.ground_truth
        ]
        
        result.normalized_ai_outputs = [
            {
                "query_id": item.get(request.pred_query_id_key, ""),
                "actual_output": ensure_string(item.get(request.pred_output_key, "")),
                "run_id": str(item.get(request.pred_run_id_key, "r1"))
            }
            for item in request.ai_outputs
        ]
        
        result.ground_truth_source = "JSON Upload"
        
        new_id = save_result(result.model_dump_json(), json.dumps(events_log), run_id=run_id)
        result.id = new_id
        
        return result
    except Exception as e:
        import traceback
        traceback.print_exc()
        await event_callback(AgentStatus(
            agent_name="System",
            status="failed",
            message=f"Batch execution failed: {str(e)}"
        ))
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/evaluate-from-paths", response_model=BatchTestResult)
async def evaluate_from_paths(request: BatchPathRequest):
    """
    Evaluate from local file paths.
    """
    try:
        if not os.path.exists(request.ground_truth_path):
            raise HTTPException(status_code=400, detail=f"Ground Truth path not found: {request.ground_truth_path}")
        
        with open(request.ground_truth_path, "r", encoding="utf-8") as f:
            gt_data = json.load(f)
            
        ai_outputs_data = []
        if os.path.isdir(request.ai_outputs_path):
            # Load all .json files in the directory
            import glob
            files = glob.glob(os.path.join(request.ai_outputs_path, "*.json"))
            for fpath in files:
                with open(fpath, "r", encoding="utf-8") as f:
                    try:
                        content = json.load(f)
                        if isinstance(content, list):
                            ai_outputs_data.extend(content)
                        else:
                            ai_outputs_data.append(content)
                    except:
                        continue
        elif os.path.exists(request.ai_outputs_path):
            with open(request.ai_outputs_path, "r", encoding="utf-8") as f:
                ai_outputs_data = json.load(f)
        else:
            raise HTTPException(status_code=400, detail=f"AI Outputs path not found: {request.ai_outputs_path}")

        # Reuse evaluate-from-json logic
        json_req = JsonEvaluationRequest(
            ground_truth=gt_data if isinstance(gt_data, list) else [gt_data],
            ai_outputs=ai_outputs_data if isinstance(ai_outputs_data, list) else [ai_outputs_data],
            gt_query_id_key=request.gt_query_id_key,
            gt_expected_key=request.gt_expected_key,
            gt_type_key=request.gt_type_key,
            pred_query_id_key=request.pred_query_id_key,
            pred_output_key=request.pred_output_key,
            pred_run_id_key=request.pred_run_id_key,
            model_name=request.model_name,
            semantic_threshold=request.semantic_threshold,
            alpha=request.alpha,
            beta=request.beta,
            gamma=request.gamma,
            enable_safety=request.enable_safety,
            w_accuracy=request.w_accuracy,
            w_completeness=request.w_completeness,
            w_hallucination=request.w_hallucination,
            w_safety=request.w_safety,
            llm_model_name=request.llm_model_name,
            accuracy_threshold=request.accuracy_threshold,
            consistency_threshold=request.consistency_threshold,
            hallucination_threshold=request.hallucination_threshold,
            rqs_threshold=request.rqs_threshold,
            llm_threshold=request.llm_threshold,
            fuzzy_threshold=request.fuzzy_threshold,
            short_text_length=request.short_text_length
        )
        
        result = await evaluate_from_json(json_req)
        result.ground_truth_source = f"File Path: {os.path.basename(request.ground_truth_path)}"
        return result
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
