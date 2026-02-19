import sqlite3
import json
from datetime import datetime
from typing import Optional, Dict, Any, List
import math

DB_NAME = "evaluations.db"

def sanitize_floats(obj):
    if isinstance(obj, float):
        if math.isnan(obj) or math.isinf(obj):
            return 0.0
        return obj
    elif isinstance(obj, dict):
        return {k: sanitize_floats(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [sanitize_floats(v) for v in obj]
    return obj

def init_db():
    """Initialize the SQLite database and create the table if it doesn't exist."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    # Check if table exists to handle migration (simple check)
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='evaluations'")
    table_exists = cursor.fetchone()
    
    if not table_exists:
        # Create new table with correct schema
        cursor.execute('''
            CREATE TABLE evaluations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                result_json TEXT NOT NULL,
                events_json TEXT,
                run_id TEXT
            )
        ''')
    else:
        # Check current schema and migrate if needed
        cursor.execute("PRAGMA table_info(evaluations)")
        columns = {info[1]: info[2] for info in cursor.fetchall()}
        
        # Check if this is the old schema (has 'name' column instead of 'result_json')
        if 'name' in columns and 'result_json' not in columns:
            print("Detected old schema. Migrating to new schema...")
            # Rename old table
            cursor.execute("ALTER TABLE evaluations RENAME TO evaluations_old")
            # Create new table with correct schema
            cursor.execute('''
                CREATE TABLE evaluations (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    result_json TEXT NOT NULL,
                    events_json TEXT,
                    run_id TEXT
                )
            ''')
            print("Migration complete. Old data preserved in evaluations_old table.")
        else:
            # New schema exists, just check for missing columns
            if "events_json" not in columns:
                cursor.execute("ALTER TABLE evaluations ADD COLUMN events_json TEXT")
            if "run_id" not in columns:
                cursor.execute("ALTER TABLE evaluations ADD COLUMN run_id TEXT")
            
    conn.commit()
    
    # Initialize Feedback Table
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='feedback'")
    feedback_table_exists = cursor.fetchone()
    
    if not feedback_table_exists:
        cursor.execute('''
            CREATE TABLE feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                rating INTEGER NOT NULL,
                suggestion TEXT
            )
        ''')
    conn.commit()

    conn.commit()
    conn.close()


# --------------- Prompts (file-based) ---------------

import os as _os

_PROMPTS_DIR = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), "prompts")


def get_prompt(prompt_key: str) -> Optional[Dict[str, Any]]:
    """Load a single prompt from its JSON file in the prompts/ folder."""
    path = _os.path.join(_PROMPTS_DIR, f"{prompt_key}.json")
    if not _os.path.isfile(path):
        return None
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def get_all_prompts() -> List[Dict[str, Any]]:
    """Load all prompt JSON files from the prompts/ folder, sorted by filename."""
    results = []
    if not _os.path.isdir(_PROMPTS_DIR):
        return results
    for fname in sorted(_os.listdir(_PROMPTS_DIR)):
        if fname.endswith(".json"):
            path = _os.path.join(_PROMPTS_DIR, fname)
            try:
                with open(path, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    data.setdefault("prompt_key", fname.replace(".json", ""))
                    results.append(data)
            except Exception as e:
                print(f"Error loading prompt {fname}: {e}")
    return results


def update_prompt(prompt_key: str, updates: Dict[str, Any]) -> bool:
    """Update a prompt JSON file. Merges updates into the existing file."""
    path = _os.path.join(_PROMPTS_DIR, f"{prompt_key}.json")
    if not _os.path.isfile(path):
        return False
    allowed = {"title", "description", "model", "temperature", "max_tokens",
               "response_format", "used_in", "system_message", "user_message_template"}
    with open(path, "r", encoding="utf-8") as f:
        data = json.load(f)
    changed = False
    for k, v in updates.items():
        if k in allowed and data.get(k) != v:
            data[k] = v
            changed = True
    if changed:
        data["updated_at"] = datetime.now().isoformat()
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write("\n")
    return changed

    

def save_result(result_json: str, events_json: str = "[]", run_id: Optional[str] = None):
    """Save a batch test result and events to the database."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute('INSERT INTO evaluations (timestamp, result_json, events_json, run_id) VALUES (?, ?, ?, ?)', (timestamp, result_json, events_json, run_id))
    new_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return new_id

def get_latest_result() -> Optional[Dict[str, Any]]:
    """Retrieve the most recent evaluation result and events."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT id, result_json, events_json FROM evaluations ORDER BY id DESC LIMIT 1')
    row = cursor.fetchone()
    conn.close()
    
    if row:
        result = json.loads(row[1])
        events = json.loads(row[2]) if row[2] else []
        # Inject ID into result object or wrap it
        result['id'] = row[0] 
        return sanitize_floats({"result": result, "events": events})
    return None

def get_all_results() -> List[Dict[str, Any]]:
    """Retrieve all historical evaluation results."""
    try:
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute('SELECT id, timestamp, result_json, run_id FROM evaluations ORDER BY id DESC')
        rows = cursor.fetchall()
        conn.close()
        
        results = []
        for row in rows:
            try:
                res_data = json.loads(row[2])
                # Add metadata
                if isinstance(res_data, dict):
                    res_data['id'] = row[0]
                    res_data['timestamp'] = row[1]
                    res_data['run_id'] = row[3] if len(row) > 3 else None
                    results.append(res_data)
                else:
                    # If it's not a dict, wrap it
                    results.append({
                        "id": row[0],
                        "timestamp": row[1],
                        "result_json": res_data,
                        "run_id": row[3] if len(row) > 3 else None
                    })
            except Exception as e:
                print(f"Error parsing record {row[0]}: {e}")
                continue
                
        return sanitize_floats(results)
    except Exception as e:
        print(f"Database error in get_all_results: {e}")
        import traceback
        traceback.print_exc()
        return []


    return results

def save_feedback(rating: int, suggestion: str):
    """Save user feedback to the database."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    timestamp = datetime.now().isoformat()
    cursor.execute('INSERT INTO feedback (timestamp, rating, suggestion) VALUES (?, ?, ?)', (timestamp, rating, suggestion))
    conn.commit()
    conn.close()

def get_all_feedback() -> List[Dict[str, Any]]:
    """Retrieve all feedback entries."""
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()
    cursor.execute('SELECT id, timestamp, rating, suggestion FROM feedback ORDER BY id DESC')
    rows = cursor.fetchall()
    conn.close()
    
    feedback_list = []
    for row in rows:
        feedback_list.append({
            "id": row[0],
            "timestamp": row[1],
            "rating": row[2],
            "suggestion": row[3]
        })
    return feedback_list
