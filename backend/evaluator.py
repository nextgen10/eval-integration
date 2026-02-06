import os
import numpy as np
import pandas as pd
from typing import List, Dict, Any
from models import RAGMetrics, TestCase
from datasets import Dataset
from ragas import evaluate
from ragas.metrics import faithfulness, answer_relevancy, context_precision, context_recall, answer_correctness
from langchain_openai import AzureChatOpenAI
from langchain_huggingface import HuggingFaceEmbeddings
from dotenv import load_dotenv
import nest_asyncio

load_dotenv()

import asyncio

class NexusEvaluator:
    def __init__(self, alpha: float = 0.4, beta: float = 0.3, gamma: float = 0.3, model_name: str = "gpt-4o"):
        nest_asyncio.apply()
        self.alpha = alpha
        self.beta = beta
        self.gamma = gamma
        
        # Initialize Azure OpenAI (GPT-4o)
        self.llm = AzureChatOpenAI(
            azure_deployment=model_name,
            openai_api_version=os.getenv("AZURE_OPENAI_API_VERSION", "2024-12-01-preview"),
            azure_endpoint=os.getenv("AZURE_OPENAI_ENDPOINT"),
            api_key=os.getenv("AZURE_OPENAI_API_KEY")
        )
        
        # Local Embedding Model path
        model_path = os.path.join(os.path.dirname(__file__), "EmbeddingModels", "all-MiniLM-L6-v2")
        self.embeddings = HuggingFaceEmbeddings(model_name=model_path)

    def calculate_rqs(self, metrics: RAGMetrics) -> float:
        """
        RQS Score (Production Grade):
        Weighted composite of Core NLP accuracy, RAG Triad, and Intent alignment.
        """
        rqs = (0.35 * metrics.semantic_similarity) + \
              (0.20 * metrics.faithfulness) + \
              (0.15 * metrics.answer_relevancy) + \
              (0.15 * metrics.context_precision) + \
              (0.15 * metrics.context_recall)
        return round(rqs, 4)

    def _safe_float(self, value) -> float:
        """Sanitizes float values to be JSON compliant (no NaN/Inf)"""
        try:
            val = float(value)
            return val if np.isfinite(val) else 0.0
        except (TypeError, ValueError):
            return 0.0

    async def _evaluate_bot(self, bid: str, dataset: List[TestCase]) -> Dict[str, RAGMetrics]:
        """Worker task for parallel evaluation"""
        try:
            print(f"DEBUG: Processing metrics for {bid}...")
            data = {
                "question": [case.query for case in dataset],
                "answer": [case.bot_responses.get(bid, "") for case in dataset],
                "contexts": [case.bot_contexts.get(bid, []) for case in dataset],
                "ground_truth": [case.ground_truth if case.ground_truth else "" for case in dataset]
            }
            rag_dataset = Dataset.from_dict(data)
            
            # Run the heavy AI evaluation in a separate thread to allow true parallelism
            result = await asyncio.to_thread(
                evaluate,
                rag_dataset,
                metrics=[faithfulness, answer_relevancy, context_recall, context_precision, answer_correctness],
                llm=self.llm,
                embeddings=self.embeddings
            )
            
            df = result.to_pandas()
            bot_results = {}
            for i, case in enumerate(dataset):
                m = df.iloc[i]
                metrics = RAGMetrics(
                    faithfulness=self._safe_float(m.get('faithfulness', 0.0)),
                    answer_relevancy=self._safe_float(m.get('answer_relevancy', 0.0)),
                    context_recall=self._safe_float(m.get('context_recall', 0.0)),
                    context_precision=self._safe_float(m.get('context_precision', 0.0)),
                    semantic_similarity=self._safe_float(m.get('answer_correctness', 0.0)),
                    latency_ms=150.0
                )
                metrics.rqs = self.calculate_rqs(metrics)
                bot_results[case.id] = metrics
            return {bid: bot_results}
        except Exception as e:
            print(f"Error evaluating {bid}: {e}")
            return {bid: {case.id: RAGMetrics(rqs=0.0) for case in dataset}}

    async def run_multi_bot_evaluation(self, dataset: List[TestCase]) -> Dict[str, Any]:
        if not dataset: return {"error": "Empty dataset"}

        bot_ids = list(dataset[0].bot_responses.keys())
        
        # Parallel Execution
        tasks = [self._evaluate_bot(bid, dataset) for bid in bot_ids]
        worker_results = await asyncio.gather(*tasks)
        
        # Merge results
        bot_metrics_result = {}
        for res in worker_results:
            bot_metrics_result.update(res)

        # Summaries & Leaderboard
        summaries = {}
        leaderboard = []
        for bid in bot_ids:
            # FIX: Do not filter out 0 values, as it inflates the averages incorrectly.
            m_values = list(bot_metrics_result[bid].values())
            avg_rqs = self._safe_float(np.mean([m.rqs for m in m_values])) if m_values else 0.0
            avg_correctness = self._safe_float(np.mean([m.semantic_similarity for m in m_values])) if m_values else 0.0
            avg_recall = self._safe_float(np.mean([m.context_recall for m in m_values])) if m_values else 0.0
            avg_faith = self._safe_float(np.mean([m.faithfulness for m in m_values])) if m_values else 0.0
            avg_relevancy = self._safe_float(np.mean([m.answer_relevancy for m in m_values])) if m_values else 0.0
            avg_precision = self._safe_float(np.mean([m.context_precision for m in m_values])) if m_values else 0.0
            avg_latency = self._safe_float(np.mean([m.latency_ms for m in m_values])) if m_values else 0.0
            
            summaries[bid] = {
                "avg_rqs": float(round(avg_rqs, 4)),
                "gt_alignment": float(round(avg_correctness, 4)),
                "retrieval_success": float(round(avg_recall, 4)),
                "avg_faithfulness": float(round(avg_faith, 4)),
                "avg_relevancy": float(round(avg_relevancy, 4)),
                "avg_context_precision": float(round(avg_precision, 4)),
                "avg_latency": float(round(avg_latency, 2)),
                "total_queries": len(dataset)
            }
            leaderboard.append({
                "bot_id": bid,
                "avg_rqs": float(round(avg_rqs, 4)),
                "gt_alignment": float(round(avg_correctness, 4)),
                "retrieval_success": float(round(avg_recall, 4)),
                "avg_faithfulness": float(round(avg_faith, 4)),
                "avg_relevancy": float(round(avg_relevancy, 4)),
                "avg_context_precision": float(round(avg_precision, 4)),
                "avg_latency": float(round(avg_latency, 2))
            })
            
        leaderboard.sort(key=lambda x: x["avg_rqs"], reverse=True)
        return {
            "bot_metrics": bot_metrics_result,
            "summaries": summaries,
            "leaderboard": leaderboard,
            "winner": leaderboard[0]["bot_id"] if leaderboard else None
        }
