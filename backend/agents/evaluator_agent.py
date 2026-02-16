from .base_agent import BaseAgent

from typing import List, Dict, Any, Optional
import json
import math

# NLP Libraries (Using only those allowed)
from sentence_transformers import SentenceTransformer, util

class EvaluatorAgent(BaseAgent):
    def __init__(self, model_name: str = "all-MiniLM-L12-v2"):
        super().__init__(name="Evaluator Agent")
        # Initialize models lazily or here if acceptable
        self.sbert_model = SentenceTransformer(model_name)

    def detect_match_type(self, text: str) -> str:
        text = text.strip()
        if "@" in text and "." in text and " " not in text:
            return "email"
        if any(char.isdigit() for char in text) and len(text) < 20:
            return "number" # Simplified
        if len(text.split()) > 20:
            return "paragraph"
        # Check for date format (simplified)
        import re
        if re.search(r'\d{2,4}-\d{1,2}-\d{1,2}', text) or re.search(r'\w+ \d{1,2}, \d{4}', text):
            return "date"
        return "text"

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Returns a dictionary matching OutputDetail structure.
        """
        input_prompt = input_data.get("input_prompt")
        actual_output = input_data.get("actual_output")
        expected_keys = input_data.get("expected_keys", [])
        expected_output_text = input_data.get("expected_output", "")
        enable_safety = input_data.get("enable_safety", False)
        
        actual_output_str = json.dumps(actual_output)
        
        comparison_text = actual_output_str
        expected_text_for_metrics = expected_output_text
        
        # Try to parse expected output as JSON
        expected_output_dict = {}
        try:
            expected_output_dict = json.loads(expected_output_text)
        except:
            pass

        # Check for missing keys first
        missing_keys = [k for k in expected_keys if k not in actual_output]
        structure_passed = len(missing_keys) == 0

        # Normalize text for comparison (extract value if single key)
        if len(expected_keys) == 1:
            key = expected_keys[0]
            # Actual
            if isinstance(actual_output, dict):
                comparison_text = str(actual_output.get(key, actual_output_str))
            
            # Expected
            if expected_output_dict and isinstance(expected_output_dict, dict):
                expected_text_for_metrics = str(expected_output_dict.get(key, expected_output_text))

        match_type = self.detect_match_type(expected_text_for_metrics)
        
        # Metrics
        emb1 = self.sbert_model.encode(comparison_text, convert_to_tensor=True)
        emb2 = self.sbert_model.encode(expected_text_for_metrics, convert_to_tensor=True)
        semantic_score = float(util.pytorch_cos_sim(emb1, emb2).item())
        
        # Accuracy Determination
        accuracy = 0.0
        if structure_passed:
            if match_type in ["email", "number", "date"]:
                # Strict equality for structured types
                if expected_text_for_metrics.strip() == comparison_text.strip():
                    accuracy = 1.0
            else:
                # Semantic check for text/paragraph
                if semantic_score > 0.8:
                    accuracy = 1.0
                
        error_type = "correct" if accuracy == 1.0 else "hallucination"
        
        return {
            "found": True,
            "match_type": match_type,
            "accuracy": accuracy,
            "expected": expected_output_text,
            "output": comparison_text,
            "run_id": "r1",
            "in_pdf": False,
            "toxicity": 0.0,
            "error_type": error_type,
            "semantic_score": semantic_score
        }

    def evaluate_consistency(self, outputs: List[str]) -> float:
        """
        Calculates consistency. 
        If single output: internal sentence coherence.
        If multiple outputs: cross-run similarity (not implemented in this single-run flow yet, defaulting to internal).
        """
        if not outputs:
            return 0.0
            
        # For now, we only have one output per run in this architecture.
        # So we calculate internal consistency (sentence coherence).
        text = outputs[0]
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if len(sentences) <= 1:
            return 1.0
            
        try:
            emb = self.sbert_model.encode(sentences, convert_to_tensor=True)
            # Calculate cosine similarity between all pairs
            sims = util.pytorch_cos_sim(emb, emb)
            
            # Get upper triangle indices (excluding diagonal)
            n = len(sentences)
            # We need to manually calculate mean of upper triangle
            sum_sim = 0.0
            count = 0
            for i in range(n):
                for j in range(i + 1, n):
                    sum_sim += float(sims[i][j])
                    count += 1
            
            if count == 0:
                return 1.0
                
            internal_score = sum_sim / count
            return (internal_score + 1.0) / 2.0 # Normalize -1..1 to 0..1
        except Exception as e:
            print(f"Consistency error: {e}")
            return 0.5

    def calculate_rqs(self, results: List[Dict[str, Any]], consistency_score: float, alpha: float = 0.6, beta: float = 0.2, gamma: float = 0.2) -> Dict[str, float]:
        """
        RQS = alpha * accuracy + beta * consistency + gamma * pdf_support_rate
        """
        # Accuracy: Average of all metric scores (normalized 0-1)
        # Or specific accuracy metric? The reference uses "accuracy" based on exact/semantic match.
        # We will average the success rate or the scores.
        
        if not results:
            return {
                "rqs": 0.0, 
                "accuracy": 0.0,
                "consistency": consistency_score,
                "pdf_support_rate": 0.0,
                "alpha": alpha,
                "beta": beta,
                "gamma": gamma
            }

        # Calculate average score across all metrics
        avg_score = sum(r["score"] for r in results) / len(results)
        
        # PDF Support Rate: In our case, we don't have PDF retrieval yet. 
        # We'll assume 1.0 if we are not testing PDF, or 0.0? 
        # Let's treat it as "Ground Truth Support" -> if we have high semantic similarity.
        # For now, let's zero it out or reuse accuracy if no PDF.
        pdf_support = 0.0 
        
        rqs = (alpha * avg_score) + (beta * consistency_score) + (gamma * pdf_support)
        
        return {
            "rqs": rqs,
            "accuracy": avg_score,
            "consistency": consistency_score,
            "pdf_support_rate": pdf_support,
            "alpha": alpha,
            "beta": beta,
            "gamma": gamma
        }
