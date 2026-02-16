from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional
from datetime import datetime

# --- Core Data Models ---

class GroundTruthRecord(BaseModel):
    query_id: str
    expected: str
    expected_type: str = "text"
    tolerance: float = 1e-6
    input_prompt: Optional[str] = None  # For DeepEval metrics
    context: Optional[str] = None  # For DeepEval RAG metrics
    metadata: Dict[str, Any] = Field(default_factory=dict)

class AIOutputRecord(BaseModel):
    query_id: str
    run_id: str
    output: str

class AgentMessage(BaseModel):
    role: str
    content: str

# --- DeepEval Configuration Models ---

class MetricConfig(BaseModel):
    """Configuration for an individual metric"""
    enabled: bool = True
    threshold: float = 0.5

class DeepEvalConfig(BaseModel):
    """Simplified configuration for DeepEval metrics if used"""
    correctness: bool = True
    hallucination: bool = True
    safety: bool = True
    alpha: float = 0.5
    beta: float = 0.5


class TestRequest(BaseModel):
    input_prompt: str
    expected_keys: List[str] = [] # Keys expected in the JSON output
    context: Optional[str] = None
    expected_output: Optional[str] = None # For NLP metrics comparison
    enable_llm_judge: bool = False
    enable_deepeval: bool = False
    deepeval_config: Optional[DeepEvalConfig] = None
    ground_truth: Optional[GroundTruthRecord] = None # Optional structured GT
    pre_computed_output: Optional[str] = None # For evaluating existing outputs
    run_id: Optional[str] = None # For NLP metrics comparison
    
    # Evaluation Config
    semantic_threshold: float = 0.72
    model_name: str = "all-MiniLM-L12-v2"
    enable_safety: bool = False
    llm_threshold: float = 0.75
    fuzzy_threshold: float = 0.85
    short_text_length: int = 40
    w_accuracy: float = 0.45
    w_completeness: float = 0.25
    w_hallucination: float = 0.15
    w_safety: float = 0.15
    llm_model_name: str = "gpt-4o"

class EvaluationMetric(BaseModel):
    name: str
    score: float
    reason: str = ""
    success: bool = True
    category: str = "General" # e.g., "NLP", "Structure", "LLM Judge"

class OutputDetail(BaseModel):
    found: bool
    match_type: str
    accuracy: float
    expected: str
    output: str
    run_id: str
    toxicity: float = 0.0
    error_type: str = "correct"
    semantic_score: Optional[float] = None
    llm_score: Optional[float] = None
    
    # JSON/Agent Specific Fields
    safety_score: Optional[float] = None
    completeness: Optional[float] = None
    hallucination: Optional[float] = None
    rqs: Optional[float] = None
    gt_keys: Optional[List[str]] = None
    aio_keys: Optional[List[str]] = None
    extra_keys: Optional[List[str]] = None
    missing_keys: Optional[List[str]] = None
    field_scores: Optional[Dict[str, Any]] = None
    reason: Optional[str] = None
    toxicity_issues: Optional[List[str]] = None
    llm_explanation: Optional[str] = None

class QueryResult(BaseModel):
    outputs: List[OutputDetail]
    n_runs: int

class AggregateMetrics(BaseModel):
    accuracy: float
    consistency: float
    completeness: float = 0.0
    hallucination: float = 0.0
    safety: float = 1.0
    rqs: float
    alpha: float
    beta: float
    gamma: float
    n_queries: int

class ErrorSummary(BaseModel):
    hallucination: int = 0
    correct: int = 0
    # Add other error types if needed

class BatchTestResult(BaseModel):
    id: Optional[int] = None
    run_id: Optional[str] = None
    per_query: Dict[str, QueryResult]
    accuracy_per_query: Dict[str, float]
    consistency_per_query: Dict[str, float]
    aggregate: AggregateMetrics
    deepeval_aggregate: Optional[Dict[str, Any]] = None
    error_summary: ErrorSummary
    evaluation_status: str
    fail_reasons: List[str]
    normalized_ground_truth: Optional[List[Dict[str, Any]]] = None
    normalized_ai_outputs: Optional[List[Dict[str, Any]]] = None
    ground_truth_source: Optional[str] = None
    evaluation_method: Optional[str] = "Unknown" # "Batch" or "JSON"

# --- Live Agent Status Models ---

class AgentStatus(BaseModel):
    agent_name: str
    status: str # "idle", "working", "completed", "failed"
    message: str
    timestamp: datetime = Field(default_factory=datetime.now)
    details: Optional[Dict[str, Any]] = None

class JsonEvaluationRequest(BaseModel):
    ground_truth: List[Dict[str, Any]]
    ai_outputs: List[Dict[str, Any]]
    # Optional mapping keys
    gt_query_id_key: str = "query_id"
    gt_expected_key: str = "expected_output"
    gt_type_key: str = "match_type"
    pred_query_id_key: str = "query_id"
    pred_output_key: str = "output"
    pred_run_id_key: str = "run_id" # Flexible dict to allow for run_id, output, query_id
    
    # Advanced Config
    semantic_threshold: float = 0.72
    alpha: float = 0.6
    beta: float = 0.2
    gamma: float = 0.2
    enable_safety: bool = False
    w_accuracy: float = 0.45
    w_completeness: float = 0.25
    w_hallucination: float = 0.15
    w_safety: float = 0.15
    model_name: str = "all-MiniLM-L12-v2"
    enable_llm_judge: bool = False
    enable_deepeval: bool = False
    deepeval_config: Optional[DeepEvalConfig] = None
    llm_model_name: str = "gpt-4o"
    
    # Evaluation Thresholds
    accuracy_threshold: float = 0.5
    consistency_threshold: float = 0.5
    hallucination_threshold: float = 0.5
    rqs_threshold: float = 0.5
    llm_threshold: float = 0.75
    fuzzy_threshold: float = 0.85
    short_text_length: int = 40

class BatchPathRequest(BaseModel):
    ground_truth_path: str
    ai_outputs_path: str
    
    # Optional mapping keys
    gt_query_id_key: str = "query_id"
    gt_expected_key: str = "expected_output"
    gt_type_key: str = "match_type"
    pred_query_id_key: str = "query_id"
    pred_output_key: str = "output"
    pred_run_id_key: str = "run_id"
    
    # Config
    semantic_threshold: float = 0.72
    alpha: float = 0.6
    beta: float = 0.2
    gamma: float = 0.2
    enable_safety: bool = False
    w_accuracy: float = 0.45
    w_completeness: float = 0.25
    w_hallucination: float = 0.15
    w_safety: float = 0.15
    model_name: str = "all-MiniLM-L12-v2"
    enable_llm_judge: bool = False
    enable_deepeval: bool = False
    deepeval_config: Optional[DeepEvalConfig] = None
    llm_model_name: str = "gpt-4o"
    
    # Evaluation Thresholds
    accuracy_threshold: float = 0.5
    consistency_threshold: float = 0.5
    hallucination_threshold: float = 0.5
    rqs_threshold: float = 0.5
    llm_threshold: float = 0.75
    fuzzy_threshold: float = 0.85
    short_text_length: int = 40

class FeedbackRequest(BaseModel):
    rating: int
    suggestion: str
