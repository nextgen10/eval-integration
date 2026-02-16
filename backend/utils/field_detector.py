import re

def detect_type(value, short_text_threshold: int = 40) -> str:
    """
    Detects the field type of a value.
    Returns: 'boolean', 'numeric', 'date', 'email', 'short_text', 'long_text', 'array', 'object', 'null', 'unknown'
    """
    if value is None:
        return 'null'
    
    if isinstance(value, bool):
        return 'boolean'
    
    if isinstance(value, (int, float)):
        return 'numeric'
    
    if isinstance(value, list):
        return 'array'
    
    if isinstance(value, dict):
        return 'object'
    
    if isinstance(value, str):
        # Email Regex
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if re.match(email_pattern, value):
            return 'email'
            
        # Date Regex (ISO 8601 YYYY-MM-DD or simple formats)
        date_pattern = r'^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?)?$'
        if re.match(date_pattern, value):
            return 'date'
            
        # Numeric string (e.g. "123.45")
        if value.replace('.', '', 1).isdigit():
             return 'numeric'
             
        # Text length check
        if len(value) < short_text_threshold:
            return 'short_text'
        else:
            return 'long_text'
            
    return 'unknown'
