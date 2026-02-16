from .base_agent import BaseAgent
from typing import Dict, Any, List, Optional
import os
import asyncio
import time
from deepeval.metrics import (
    GEval, 
    HallucinationMetric, 
    FaithfulnessMetric, 
    AnswerRelevancyMetric,
    ContextualPrecisionMetric,
    ContextualRecallMetric,
    ContextualRelevancyMetric,
    ToxicityMetric,
    BiasMetric,
    PIILeakageMetric,
    SummarizationMetric
)
from deepeval.models import AzureOpenAIModel
from deepeval.test_case import LLMTestCase, LLMTestCaseParams

# Import config model
import sys
sys.path.append(os.path.dirname(os.path.dirname(__file__)))
from agent_models import DeepEvalConfig, MetricConfig

class DeepEvalAgent(BaseAgent):
    def __init__(self, config: Optional[DeepEvalConfig] = None, status_callback=None):
        super().__init__(name="DeepEval Agent")
        self.config = config or DeepEvalConfig()
        self.status_callback = status_callback
        
        # Initialize Azure OpenAI Model once
        self.azure_llm_model = None
        if os.getenv("AZURE_OPENAI_API_KEY"):
            deployment_name = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4")
            self.azure_llm_model = AzureOpenAIModel(
                deployment_name=deployment_name,
                openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
                azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
                azure_openai_api_key=os.getenv("AZURE_OPENAI_API_KEY")
            )
            print(f"DEBUG: DeepEvalAgent initialized with Azure OpenAI Model: {deployment_name}")
        else:
            print("DEBUG: DeepEvalAgent - AZURE_OPENAI_API_KEY not found. Using default OpenAI model.")

    def _is_enabled(self, metric_name: str) -> bool:
        """Check if a metric is enabled in configuration"""
        metric_config = getattr(self.config, metric_name, None)
        return metric_config.enabled if metric_config else False
    
    def _get_threshold(self, metric_name: str) -> float:
        """Get threshold for a metric from configuration"""
        metric_config = getattr(self.config, metric_name, None)
        return metric_config.threshold if metric_config else 0.5

    async def emit_status(self, status: str, message: str, details: Dict[str, Any] = None):
        """Emit status event if callback is available"""
        if self.status_callback:
            await self.status_callback(self.name, status, message, details)

    async def _measure_safely(self, metric, test_case, metric_name: str) -> Optional[Dict[str, Any]]:
        """
        Safely measure a single metric with error handling.
        Returns dict with score and reason, or None if failed.
        """
        try:
            await self.emit_status("working", f"Evaluating {metric_name}...")
            await metric.a_measure(test_case)
            result = {"score": metric.score}
            
            # Extract reason if available
            if hasattr(metric, 'reason') and metric.reason:
                result["reason"] = metric.reason
            
            await self.emit_status("working", f"{metric_name} Score: {metric.score}")
            return result
        except Exception as e:
            print(f"Warning: {metric_name} failed: {e}")
            await self.emit_status("working", f"{metric_name} Failed: {str(e)}")
            return None

    async def _calculate_correctness(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate G-Eval Correctness metric"""
        if not self._is_enabled("correctness"):
            await self.emit_status("info", "⏭️  G-Eval Correctness: Skipped (disabled in configuration)")
            return None
        
        try:
            threshold = self._get_threshold("correctness")
            correctness_metric = GEval(
                name="Correctness",
                criteria="Determine whether the actual output is factually correct and matches the expected output.",
                evaluation_params=[LLMTestCaseParams.ACTUAL_OUTPUT, LLMTestCaseParams.EXPECTED_OUTPUT],
                threshold=threshold,
                model=self.azure_llm_model
            )
            return await self._measure_safely(correctness_metric, test_case, "G-Eval Correctness")
        except Exception as e:
            print(f"Error initializing Correctness metric: {e}")
            return None

    async def _calculate_answer_relevancy(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Answer Relevancy metric (requires input_prompt)"""
        if not self._is_enabled("answer_relevancy"):
            await self.emit_status("info", "⏭️  Answer Relevancy: Skipped (disabled in configuration)")
            return None
        
        # Skip if no input prompt provided
        if not test_case.input or not test_case.input.strip():
            await self.emit_status("info", "⏭️  Answer Relevancy: Skipped (missing required field: input_prompt)")
            return None
        
        try:
            threshold = self._get_threshold("answer_relevancy")
            metric = AnswerRelevancyMetric(threshold=threshold, model=self.azure_llm_model)
            return await self._measure_safely(metric, test_case, "Answer Relevancy")
        except Exception as e:
            print(f"Error initializing Answer Relevancy metric: {e}")
            return None

    async def _calculate_summarization(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Summarization metric"""
        if not self._is_enabled("summarization"):
            await self.emit_status("info", "⏭️  Summarization: Skipped (disabled in configuration)")
            return None
        
        try:
            threshold = self._get_threshold("summarization")
            metric = SummarizationMetric(threshold=threshold, model=self.azure_llm_model)
            return await self._measure_safely(metric, test_case, "Summarization")
        except Exception as e:
            print(f"Error initializing Summarization metric: {e}")
            return None

    async def _calculate_faithfulness(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Faithfulness metric (requires context)"""
        if not self._is_enabled("faithfulness"):
            await self.emit_status("info", "⏭️  Faithfulness: Skipped (disabled in configuration)")
            return None
        
        # Skip if no context provided
        if not test_case.retrieval_context or len(test_case.retrieval_context) == 0:
            await self.emit_status("info", "⏭️  Faithfulness: Skipped (missing required field: context)")
            return None
        
        try:
            threshold = self._get_threshold("faithfulness")
            metric = FaithfulnessMetric(threshold=threshold, model=self.azure_llm_model)
            return await self._measure_safely(metric, test_case, "Faithfulness")
        except Exception as e:
            print(f"Error initializing Faithfulness metric: {e}")
            return None

    async def _calculate_hallucination(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Hallucination metric (requires context)"""
        if not self._is_enabled("hallucination"):
            await self.emit_status("info", "⏭️  Hallucination: Skipped (disabled in configuration)")
            return None
        
        # Skip if no context provided
        if not test_case.retrieval_context or len(test_case.retrieval_context) == 0:
            await self.emit_status("info", "⏭️  Hallucination: Skipped (missing required field: context)")
            return None
        
        try:
            threshold = self._get_threshold("hallucination")
            metric = HallucinationMetric(threshold=threshold, model=self.azure_llm_model)
            result = await self._measure_safely(metric, test_case, "Hallucination")
            # Note: DeepEval's HallucinationMetric already returns scores where lower is better
            # (0.0 = no hallucination, 1.0 = maximum hallucination), so no inversion needed
            return result
        except Exception as e:
            print(f"Error initializing Hallucination metric: {e}")
            return None

    async def _calculate_contextual_precision(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Contextual Precision metric (requires context)"""
        if not self._is_enabled("contextual_precision"):
            await self.emit_status("info", "⏭️  Contextual Precision: Skipped (disabled in configuration)")
            return None
        
        # Skip if no input prompt
        if not test_case.input or not test_case.input.strip():
            await self.emit_status("info", "⏭️  Contextual Precision: Skipped (missing required field: input_prompt)")
            return None
        
        # Skip if no context provided
        if not test_case.retrieval_context or len(test_case.retrieval_context) == 0:
            await self.emit_status("info", "⏭️  Contextual Precision: Skipped (missing required field: context)")
            return None
        
        try:
            threshold = self._get_threshold("contextual_precision")
            metric = ContextualPrecisionMetric(threshold=threshold, model=self.azure_llm_model)
            return await self._measure_safely(metric, test_case, "Contextual Precision")
        except Exception as e:
            print(f"Error initializing Contextual Precision metric: {e}")
            return None

    async def _calculate_contextual_recall(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Contextual Recall metric (requires context)"""
        if not self._is_enabled("contextual_recall"):
            await self.emit_status("info", "⏭️  Contextual Recall: Skipped (disabled in configuration)")
            return None
        
        # Skip if no input prompt
        if not test_case.input or not test_case.input.strip():
            await self.emit_status("info", "⏭️  Contextual Recall: Skipped (missing required field: input_prompt)")
            return None
        
        # Skip if no context provided
        if not test_case.retrieval_context or len(test_case.retrieval_context) == 0:
            await self.emit_status("info", "⏭️  Contextual Recall: Skipped (missing required field: context)")
            return None
        
        try:
            threshold = self._get_threshold("contextual_recall")
            metric = ContextualRecallMetric(threshold=threshold, model=self.azure_llm_model)
            return await self._measure_safely(metric, test_case, "Contextual Recall")
        except Exception as e:
            print(f"Error initializing Contextual Recall metric: {e}")
            return None

    async def _calculate_contextual_relevancy(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Contextual Relevancy metric (requires context)"""
        if not self._is_enabled("contextual_relevancy"):
            await self.emit_status("info", "⏭️  Contextual Relevancy: Skipped (disabled in configuration)")
            return None
        
        # Skip if no input prompt  
        if not test_case.input or not test_case.input.strip():
            await self.emit_status("info", "⏭️  Contextual Relevancy: Skipped (missing required field: input_prompt)")
            return None
        
        # Skip if no context provided
        if not test_case.retrieval_context or len(test_case.retrieval_context) == 0:
            await self.emit_status("info", "⏭️  Contextual Relevancy: Skipped (missing required field: context)")
            return None
        
        try:
            threshold = self._get_threshold("contextual_relevancy")
            metric = ContextualRelevancyMetric(threshold=threshold, model=self.azure_llm_model)
            return await self._measure_safely(metric, test_case, "Contextual Relevancy")
        except Exception as e:
            print(f"Error initializing Contextual Relevancy metric: {e}")
            return None

    async def _calculate_toxicity(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Toxicity metric"""
        if not self._is_enabled("toxicity"):
            await self.emit_status("info", "⏭️  Toxicity: Skipped (disabled in configuration)")
            return None
        
        try:
            threshold = self._get_threshold("toxicity")
            metric = ToxicityMetric(threshold=threshold, model=self.azure_llm_model)
            return await self._measure_safely(metric, test_case, "Toxicity")
        except Exception as e:
            print(f"Error initializing Toxicity metric: {e}")
            return None

    async def _calculate_bias(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate Bias metric"""
        if not self._is_enabled("bias"):
            await self.emit_status("info", "⏭️  Bias: Skipped (disabled in configuration)")
            return None
        
        try:
            threshold = self._get_threshold("bias")
            metric = BiasMetric(threshold=threshold, model=self.azure_llm_model)
            return await self._measure_safely(metric, test_case, "Bias")
        except Exception as e:
            print(f"Error initializing Bias metric: {e}")
            return None

    async def _calculate_pii_leakage(self, test_case) -> Optional[Dict[str, Any]]:
        """Calculate PII Leakage metric"""
        if not self._is_enabled("pii_leakage"):
            await self.emit_status("info", "⏭️  PII Leakage: Skipped (disabled in configuration)")
            return None
        
        try:
            threshold = self._get_threshold("pii_leakage")
            metric = PIILeakageMetric(threshold=threshold, model=self.azure_llm_model)
            result = await self._measure_safely(metric, test_case, "PII Leakage")
            
            # Invert score: DeepEval PIILeakageMetric returns 1.0 for Safe/No Leakage,
            # but we want to match standard 'lower is better' semantics (0.0 = no leakage).
            # This is different from HallucinationMetric which already uses 'lower is better'.
            if result and result.get("score") is not None:
                result["score"] = 1.0 - result["score"]
            
            return result
        except Exception as e:
            print(f"Error initializing PII Leakage metric: {e}")
            return None

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Runs DeepEval metrics with individual error handling and parallelization.
        Returns a dictionary with metrics, metadata, and success status.
        """
        start_time = time.time()
        
        candidate = input_data.get("candidate", "")
        reference = input_data.get("reference", "")
        input_prompt = input_data.get("input_prompt", "")
        retrieval_context = input_data.get("retrieval_context", [])
        
        # Ensure retrieval_context is a list of strings
        if isinstance(retrieval_context, str):
            retrieval_context = [retrieval_context] if retrieval_context else []
        
        has_context = bool(retrieval_context)
        
        # Create Test Case
        test_case = LLMTestCase(
            input=input_prompt,
            actual_output=candidate,
            expected_output=reference,
            retrieval_context=retrieval_context if has_context else None,
            context=retrieval_context if has_context else None # Pass context for HallucinationMetric compatibility
        )

        metrics_result = {}
        
        # Group 1: Independent metrics (no context required) - can run in parallel
        independent_tasks = {
            "correctness": self._calculate_correctness(test_case),
            "answer_relevancy": self._calculate_answer_relevancy(test_case),
            "summarization": self._calculate_summarization(test_case),
            "toxicity": self._calculate_toxicity(test_case),
            "bias": self._calculate_bias(test_case),
            "pii_leakage": self._calculate_pii_leakage(test_case),
        }
        
        # Group 2: Context-dependent metrics - only run if context exists
        context_tasks = {}
        if has_context:
            context_tasks = {
                "faithfulness": self._calculate_faithfulness(test_case),
                "hallucination": self._calculate_hallucination(test_case),
                "contextual_precision": self._calculate_contextual_precision(test_case),
                "contextual_recall": self._calculate_contextual_recall(test_case),
                "contextual_relevancy": self._calculate_contextual_relevancy(test_case),
            }
        
        # Execute all enabled metrics in parallel
        all_tasks = {**independent_tasks, **context_tasks}
        
        # Filter out None tasks (disabled metrics)
        enabled_tasks = {k: v for k, v in all_tasks.items() if v is not None}
        
        # Run in parallel
        if enabled_tasks:
            results = await asyncio.gather(*enabled_tasks.values(), return_exceptions=True)
            
            # Map results back to metric names
            for (metric_name, _), result in zip(enabled_tasks.items(), results):
                if isinstance(result, Exception):
                    print(f"Exception in {metric_name}: {result}")
                    metrics_result[metric_name] = None
                elif result is not None:
                    # Store score
                    metrics_result[metric_name] = result.get("score")
                    # Store reason if available (especially for correctness)
                    if "reason" in result and metric_name == "correctness":
                        metrics_result["geval_reason"] = result["reason"]
                else:
                    metrics_result[metric_name] = None
        
        # For enabled context metrics without context, set to None (not applicable)
        if not has_context:
            for metric_name in ["faithfulness", "hallucination", "contextual_precision", 
                              "contextual_recall", "contextual_relevancy"]:
                # Only add if metric was enabled
                if self._is_enabled(metric_name) and metric_name not in metrics_result:
                    metrics_result[metric_name] = None
                    
        # Calculate DeepEval RQS with dynamic weight normalization
        # Formula: alpha * Correctness + beta * Answer Relevancy + gamma * Faithfulness
        # When metrics are NA (None), we normalize weights across only available metrics
        try:
            # Get weights from config, default to 0.6, 0.2, 0.2
            alpha = getattr(self.config, 'alpha', 0.6)
            beta = getattr(self.config, 'beta', 0.2)
            gamma = getattr(self.config, 'gamma', 0.2)
            
            # Build list of (weight, score) pairs for available metrics
            available_metrics = []
            
            d_corr = metrics_result.get("correctness")
            if d_corr is not None:
                available_metrics.append((alpha, d_corr))
            
            d_rel = metrics_result.get("answer_relevancy")
            if d_rel is not None:
                available_metrics.append((beta, d_rel))
            
            d_faith = metrics_result.get("faithfulness")
            if d_faith is not None:
                available_metrics.append((gamma, d_faith))
            
            # Calculate normalized RQS
            if available_metrics:
                # Normalize weights to sum to 1.0
                total_weight = sum(weight for weight, _ in available_metrics)
                normalized_rqs = sum((weight / total_weight) * score for weight, score in available_metrics)
                metrics_result["deepeval_rqs"] = normalized_rqs
            else:
                # No metrics available
                metrics_result["deepeval_rqs"] = 0.0
                
        except Exception as e:
            print(f"Error calculating DeepEval RQS: {e}")
            metrics_result["deepeval_rqs"] = 0.0
        
        # Calculate metadata
        execution_time = time.time() - start_time
        # Exclude metadata keys from counts
        metric_keys = [k for k in metrics_result.keys() if k not in ["metadata", "success", "geval_reason"]]
        metrics_calculated = sum(1 for k in metric_keys if metrics_result[k] is not None)
        # Count only enabled metrics that failed (returned None)
        metrics_failed = sum(1 for k in metric_keys if metrics_result[k] is None and self._is_enabled(k))
        failed_metrics = [k for k in metric_keys if metrics_result[k] is None and self._is_enabled(k)]
        
        # Add metadata
        disabled_metrics = [k for k in all_tasks.keys() if not self._is_enabled(k)]
        metrics_result["metadata"] = {
            "execution_time_seconds": round(execution_time, 2),
            "metrics_calculated": metrics_calculated,
            "metrics_failed": metrics_failed,
            "metrics_skipped": len(all_tasks) - len(enabled_tasks),
            "failed_metrics": failed_metrics,
            "disabled_metrics": disabled_metrics,
            "has_context": has_context,
            "azure_model": os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4") if self.azure_llm_model else "default"
        }
        
        metrics_result["success"] = metrics_calculated > 0
        
        return metrics_result
