from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from typing import List
from fastapi.middleware.cors import CORSMiddleware
from models import EvaluationRequest, EvaluationResult, TestCase
from evaluator import NexusEvaluator
import uuid
from datetime import datetime
import pandas as pd
import io
import math

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

app = FastAPI(title="NexusEval Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from database import SessionLocal, EvaluationRecord
import json

# DB Helper
def save_to_db(result: EvaluationResult):
    db = SessionLocal()
    try:
        # Convert Pydantic model to dict for JSON storage
        res_data = result.model_dump()
        record = EvaluationRecord(
            id=res_data["id"],
            name=res_data["name"],
            timestamp=res_data["timestamp"],
            test_cases=res_data["test_cases"],
            bot_metrics=res_data["bot_metrics"],
            summaries=res_data["summaries"],
            leaderboard=res_data["leaderboard"],
            winner=res_data["winner"]
        )
        db.add(record)
        db.commit()
    finally:
        db.close()

@app.get("/latest", response_model=EvaluationResult)
async def get_latest_evaluation():
    db = SessionLocal()
    try:
        record = db.query(EvaluationRecord).order_by(EvaluationRecord.timestamp.desc()).first()
        if not record:
            raise HTTPException(status_code=404, detail="No evaluations found")
        
        return EvaluationResult(
            id=record.id,
            name=record.name,
            timestamp=record.timestamp,
            test_cases=record.test_cases,
            bot_metrics=record.bot_metrics,
            summaries=record.summaries,
            leaderboard=record.leaderboard,
            winner=record.winner
        )
    finally:
        db.close()

@app.post("/evaluate-excel", response_model=EvaluationResult)
async def evaluate_excel(
    file: UploadFile = File(...),
    alpha: float = Form(0.4),
    beta: float = Form(0.3),
    gamma: float = Form(0.3),
    model: str = Form("gpt-4o")
):
    try:
        contents = await file.read()
        df = pd.read_excel(io.BytesIO(contents))
        
        # Dynamically detect bots based on column prefixes
        bot_columns = [col for col in df.columns if col.startswith("Bot_")]
        
        # Create a mapping from column name to standardized Bot Name (Bot A, Bot B, ...)
        bot_mapping = {}
        for idx, col in enumerate(bot_columns):
            # Generate "Bot A", "Bot B", ...
            suffix = chr(65 + idx) if idx < 26 else f"{chr(65 + (idx // 26) - 1)}{chr(65 + (idx % 26))}"
            bot_mapping[col] = f"Bot {suffix}"

        # Flexible column detection
        def find_col(possible_names):
            for col in df.columns:
                if any(p.lower() in col.lower().replace(" ", "_") for p in possible_names):
                    return col
            return None

        gt_col = find_col(["ground_truth", "reference", "target", "gt", "expected"])
        query_col = find_col(["query", "question", "input", "prompt"])

        test_cases = []
        for _, row in df.iterrows():
            bot_responses = {}
            bot_contexts = {}
            
            for bot_col in bot_columns:
                bot_id = bot_mapping[bot_col]
                bot_responses[bot_id] = str(row.get(bot_col, ""))
                
                # 1. Try specific context: Context_BotName
                # 2. Try general context: Context
                # 3. Fallback to empty list
                context_col = bot_col.replace("Bot_", "Context_")
                ctx_val = None
                if context_col in df.columns:
                    ctx_val = row.get(context_col)
                elif "Context" in df.columns:
                    ctx_val = row.get("Context")
                elif "context" in df.columns:
                    ctx_val = row.get("context")
                
                # Sanitize context (handle NaN/None)
                if pd.isna(ctx_val) or ctx_val is None:
                    bot_contexts[bot_id] = []
                else:
                    bot_contexts[bot_id] = [str(ctx_val)]
            
            test_cases.append(TestCase(
                query=str(row.get(query_col if query_col else "Query", "N/A")),
                bot_responses=bot_responses,
                bot_contexts=bot_contexts,
                ground_truth=str(row.get(gt_col if gt_col else "Ground_Truth", "")) if gt_col or "Ground_Truth" in df.columns else None
            ))

        evaluator = NexusEvaluator(alpha=alpha, beta=beta, gamma=gamma, model_name=model)
        print(f"DEBUG: Starting evaluation for {len(bot_columns)} models...")
        results = await evaluator.run_multi_bot_evaluation(test_cases)
        print("DEBUG: Evaluation successful!")
        
        eval_id = str(uuid.uuid4())
        result = EvaluationResult(
            id=eval_id,
            name=f"Excel Upload - {file.filename}",
            timestamp=datetime.now(),
            test_cases=test_cases,
            bot_metrics=results["bot_metrics"],
            summaries=results["summaries"],
            leaderboard=results["leaderboard"],
            winner=results["winner"]
        )
        
        save_to_db(result)
        return result

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Excel processing failed: {str(e)}")

@app.post("/evaluate", response_model=EvaluationResult)
async def run_evaluation(request: EvaluationRequest):
    evaluator = NexusEvaluator(alpha=request.alpha, beta=request.beta, gamma=request.gamma)
    results = await evaluator.run_multi_bot_evaluation(request.dataset)

    eval_id = str(uuid.uuid4())
    result = EvaluationResult(
        id=eval_id,
        name=request.name,
        timestamp=datetime.now(),
        test_cases=request.dataset,
        bot_metrics=results["bot_metrics"],
        summaries=results["summaries"],
        leaderboard=results["leaderboard"],
        winner=results["winner"]
    )
    
    save_to_db(result)
    return result

@app.get("/evaluations", response_model=List[EvaluationResult])
async def get_all_evaluations():
    db = SessionLocal()
    try:
        records = db.query(EvaluationRecord).order_by(EvaluationRecord.timestamp.desc()).all()
        return [
            EvaluationResult(
                id=record.id,
                name=record.name,
                timestamp=record.timestamp,
                test_cases=sanitize_floats(record.test_cases),
                bot_metrics=sanitize_floats(record.bot_metrics),
                summaries=sanitize_floats(record.summaries),
                leaderboard=sanitize_floats(record.leaderboard),
                winner=record.winner
            ) for record in records
        ]
    finally:
        db.close()

@app.get("/evaluations/{eval_id}")
async def get_evaluation(eval_id: str):
    db = SessionLocal()
    try:
        record = db.query(EvaluationRecord).filter(EvaluationRecord.id == eval_id).first()
        if not record:
            raise HTTPException(status_code=404, detail="Evaluation not found")
        return record
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, loop="asyncio")
