from typing import List, Dict, Any
from .base_agent import BaseAgent

class ConsistencyAgent(BaseAgent):
    def __init__(self, model_name: str = "all-MiniLM-L12-v2"):
        super().__init__(name="Consistency Agent")
        self.model_name = model_name
        self.model = None

    def _load_model(self):
        if self.model is None:
            from sentence_transformers import SentenceTransformer, util
            self.model = SentenceTransformer(self.model_name)
            self.util = util

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Input:
            outputs: List[str] - List of outputs to check consistency for.
        """
        outputs = input_data.get("outputs", [])
        if not outputs:
            return {"score": 0.0}

        # If multiple outputs (cross-run consistency)
        if len(outputs) > 1:
            return self._calculate_cross_run_consistency(outputs)
        else:
            # Single output (internal consistency)
            return self._calculate_internal_consistency(outputs[0])

    def _calculate_cross_run_consistency(self, outputs: List[str]) -> Dict[str, Any]:
        try:
            self._load_model()
            emb = self.model.encode(outputs, convert_to_tensor=True)
            sims = self.util.pytorch_cos_sim(emb, emb)
            
            n = len(outputs)
            sum_sim = 0.0
            count = 0
            for i in range(n):
                for j in range(i + 1, n):
                    sum_sim += float(sims[i][j])
                    count += 1
            
            score = (sum_sim / count) if count > 0 else 1.0
            normalized_score = (score + 1.0) / 2.0
            return {"score": normalized_score, "type": "cross-run"}
        except Exception as e:
            print(f"Cross-run consistency error: {e}")
            return {"score": 0.0, "error": str(e)}

    def _calculate_internal_consistency(self, text: str) -> Dict[str, Any]:
        sentences = [s.strip() for s in text.split('.') if s.strip()]
        
        if len(sentences) <= 1:
            return {"score": 1.0, "type": "internal"}
            
        try:
            self._load_model()
            emb = self.model.encode(sentences, convert_to_tensor=True)
            sims = self.util.pytorch_cos_sim(emb, emb)
            
            n = len(sentences)
            sum_sim = 0.0
            count = 0
            for i in range(n):
                for j in range(i + 1, n):
                    sum_sim += float(sims[i][j])
                    count += 1
            
            score = (sum_sim / count) if count > 0 else 1.0
            normalized_score = (score + 1.0) / 2.0
            return {"score": normalized_score, "type": "internal"}
        except Exception as e:
            print(f"Internal consistency error: {e}")
            return {"score": 0.0, "error": str(e)}
