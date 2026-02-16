from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class JsonEvalConfig(BaseModel):
    semantic_threshold: float = 0.80
    fuzzy_threshold: float = 0.85
    short_text_length: int = 40
    w_accuracy: float = 0.45
    w_completeness: float = 0.25
    w_hallucination: float = 0.15
    w_safety: float = 0.15
    model_name: str = "all-MiniLM-L12-v2"
    enable_safety: bool = True
    llm_model: str = "gpt-4o"
    llm_api_key: Optional[str] = None

class FieldScore(BaseModel):
    field_name: str
    field_type: str
    gt_value: Any
    aio_value: Any
    match_strategy: str
    score: float
    similarity: float

class JsonEvalResult(BaseModel):
    completeness: float
    hallucination: float
    accuracy: float
    safety_score: float
    toxicity: float = 0.0
    tone: str
    rqs: float
    consistency: Optional[float] = None
    field_scores: List[FieldScore]
    gt_keys: List[str]
    aio_keys: List[str]
    matching_keys: List[str]
    extra_keys: List[str]
    missing_keys: List[str]

class JsonEvalRequest(BaseModel):
    ground_truth: Dict[str, Any]
    agent_output: Dict[str, Any]
    config: Optional[JsonEvalConfig] = None

class JsonBatchEvalRequest(BaseModel):
    ground_truth: Dict[str, Any]
    agent_outputs: List[Dict[str, Any]]
    config: Optional[JsonEvalConfig] = None

class JsonBatchEvalResponse(BaseModel):
    results: List[JsonEvalResult]
    best_response_idx: int
    best_rqs: float
    mean_rqs: float
    variance: float
    std_dev: float
    ranking: List[int]
    consistency_score: Optional[float] = None
