from datetime import datetime
from rapidfuzz import fuzz
from sentence_transformers import SentenceTransformer, util
# Note: For long text (semantic match), we need a loaded model. 
# We'll handle model loading lazily or via dependency injection in the main agent to avoid overhead here.
# But for simplicity, we can load a default if not provided, or better, pass the model instance.

def calculate_similarity(gt_value, aio_value, field_type, config, model=None):
    """
    Calculates similarity score based on field type and matching strategy.
    
    Returns: (score (0.0-1.0), similarity(0.0-1.0), strategy_name)
    """
    
    # 1. Exact Match Strategy
    if field_type in ['numeric', 'boolean', 'date', 'email', 'array', 'object', 'null']:
        strategy = 'exact'
        
        # Handle stringified numbers/dates if needed, but assuming parsed JSON types or normalized strings
        is_match = (str(gt_value).strip().lower() == str(aio_value).strip().lower())
        
        return (1.0 if is_match else 0.0), (1.0 if is_match else 0.0), strategy

    # 2. Fuzzy Match Strategy (Short Text)
    if field_type == 'short_text':
        strategy = 'fuzzy'
        similarity = fuzz.token_sort_ratio(str(gt_value), str(aio_value)) / 100.0
        
        if similarity >= config.fuzzy_threshold:
            return 1.0, similarity, strategy
        else:
            return 0.0, similarity, strategy

    # 3. Semantic Match Strategy (Long Text)
    if field_type == 'long_text':
        strategy = 'semantic'
        if model is None:
            # Fallback if model not provided (e.g. unit tests without model loading)
            # Use fuzzy as backup or load model (expensive)
            similarity = fuzz.token_sort_ratio(str(gt_value), str(aio_value)) / 100.0
        else:
            # Calculate embeddings
            emb1 = model.encode(str(gt_value), convert_to_tensor=True)
            emb2 = model.encode(str(aio_value), convert_to_tensor=True)
            similarity = float(util.pytorch_cos_sim(emb1, emb2)[0][0])
            
        if similarity >= config.semantic_threshold:
            return 1.0, similarity, strategy
        else:
            return 0.0, similarity, strategy

    # Default fallback
    return 0.0, 0.0, 'unknown'
