from typing import Dict, Any, List
import json
import asyncio
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer

from agent_models_json import JsonEvalResult, JsonBatchEvalResponse, FieldScore, JsonEvalConfig
from utils.field_detector import detect_type
from utils.matching_strategies import calculate_similarity
from utils.toxicity_checker import check_toxicity, ToxicityResult

class JsonEvaluatorAgent:
    def __init__(self, model_name: str = "all-MiniLM-L12-v2"):
        self.model_name = model_name
        self.model = None

    def _load_model(self):
        # Lazy loading of embeddings model
        if self.model is None:
            self.model = SentenceTransformer(self.model_name)

    async def evaluate_single(self, gt: Dict[str, Any], aio: Dict[str, Any], config: JsonEvalConfig) -> JsonEvalResult:
        """
        Evaluates a single AI Output against Ground Truth JSON.
        """
        self._load_model()
        
        # Flatten JSON keys for comparison (optional but simplifies nested access)
        # Assuming simple top-level for now or user passes flat dicts
        gt_keys = list(gt.keys())
        aio_keys = list(aio.keys())
        
        matching_keys = [k for k in gt_keys if k in aio_keys]
        missing_keys = [k for k in gt_keys if k not in aio_keys]
        extra_keys = [k for k in aio_keys if k not in gt_keys]
        
        # 1. Completeness
        completeness_score = len(matching_keys) / len(gt_keys) if gt_keys else 1.0
        
        # 2. Hallucination
        hallucination_score = len(extra_keys) / len(aio_keys) if aio_keys else 0.0
        
        # 3. Accuracy Calculation (Field-by-Field)
        field_scores = []
        total_acc_score = 0.0
        
        for key in matching_keys:
            gt_val = gt[key]
            aio_val = aio[key]
            
            # Detect Type with configurable threshold
            field_type = detect_type(gt_val, short_text_threshold=config.short_text_length)
            
            # Select Strategy & Calc Score
            score, sim, strategy = calculate_similarity(gt_val, aio_val, field_type, config, self.model)
            
            field_scores.append(FieldScore(
                field_name=key,
                field_type=field_type,
                gt_value=gt_val,
                aio_value=aio_val,
                match_strategy=strategy,
                score=score,
                similarity=sim
            ))
            total_acc_score += score
            
        accuracy_score = (total_acc_score / len(matching_keys)) if matching_keys else (1.0 if not gt_keys else 0.0)
        
        # 4. Safety Check (Optional & Expensive)
        safety_res = ToxicityResult(toxicity_score=0.0, safety_score=1.0, tone="neutral", issues=[])
        if config.enable_safety and config.llm_api_key:
            # Concatenate values for checking context
            # Or verify specific string fields
            text_to_check = json.dumps(aio)
            safety_res = await check_toxicity(text_to_check, config.llm_model, config.llm_api_key)

        # 5. RQS Calculation
        # RQS = (W_acc * Acc) + (W_comp * Comp) + (W_safety * Safe) - (W_hall * Hall)
        # Note: Hallucination is negative, others positive
        rqs = (config.w_accuracy * accuracy_score) + \
              (config.w_completeness * completeness_score) + \
              (config.w_safety * safety_res.safety_score) - \
              (config.w_hallucination * hallucination_score)
              
        return JsonEvalResult(
            completeness=completeness_score,
            hallucination=hallucination_score,
            accuracy=accuracy_score,
            safety_score=safety_res.safety_score,
            toxicity=1.0 - safety_res.safety_score,
            tone=safety_res.tone,
            rqs=max(min(rqs, 1.0), 0.0), # Clamp 0-1
            field_scores=field_scores,
            gt_keys=gt_keys,
            aio_keys=aio_keys,
            matching_keys=matching_keys,
            extra_keys=extra_keys,
            missing_keys=missing_keys
        )

    async def evaluate_batch(self, gt: Dict[str, Any], aio_list: List[Dict[str, Any]], config: JsonEvalConfig) -> JsonBatchEvalResponse:
        """
        Evaluates a batch of AI Outputs against a single Ground Truth.
        Includes Aggregate Stats & Consistency Check.
        """
        results = []
        consistency_input_texts = []
        
        for aio in aio_list:
            res = await self.evaluate_single(gt, aio, config)
            results.append(res)
            # Use stringified JSON for consistency check across runs
            consistency_input_texts.append(json.dumps(aio))
            
        # Consistency Check (Cross-Run)
        from agents.consistency_agent import ConsistencyAgent
        consistency_agent = ConsistencyAgent(model_name=config.model_name)
        
        # Re-use existing Consistency Agent logic
        # It expects {"outputs": [list of strings]}
        consistency_output = await consistency_agent.run({"outputs": consistency_input_texts})
        consistency_score = consistency_output.get("score", 0.0)
        
        # Calculate Aggregates
        rqs_scores = [r.rqs for r in results]
        mean_rqs = sum(rqs_scores) / len(rqs_scores) if rqs_scores else 0.0
        
        import numpy as np
        variance = np.var(rqs_scores) if rqs_scores else 0.0
        std_dev = np.std(rqs_scores) if rqs_scores else 0.0
        
        best_idx = int(np.argmax(rqs_scores)) if rqs_scores else -1
        ranking = list(np.argsort(rqs_scores)[::-1]) # Descending order
        
        return JsonBatchEvalResponse(
            results=results,
            best_response_idx=best_idx,
            best_rqs=max(rqs_scores) if rqs_scores else 0.0,
            mean_rqs=mean_rqs,
            variance=float(variance),
            std_dev=float(std_dev),
            ranking=[int(x) for x in ranking],
            consistency_score=consistency_score
        )
