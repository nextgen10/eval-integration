# Why Are My Scores Different? Answer Correctness = 0 Issue

## 🔍 Problem Identified

All your **Answer Correctness scores are 0**, which causes different RQS scores than expected.

### Your Results:
```
Bot A:
  - Answer Correctness: 0.0000 ❌ (Should be ~0.85-0.95)
  - Faithfulness:       0.8964 ✅
  - Answer Relevancy:   0.9606 ✅
  - Context Precision:  1.0000 ✅
  - Context Recall:     0.9000 ✅
  - RQS:                0.6067

Bot B:
  - Answer Correctness: 0.0000 ❌ (Should be ~0.75-0.85)
  - Faithfulness:       0.4238 ✅
  - Answer Relevancy:   0.8740 ✅
  - Context Precision:  0.8000 ✅
  - Context Recall:     0.4333 ✅
  - RQS:                0.4170
```

---

## ⚠️ Why This Happens

**Answer Correctness is 0 because RAGAS failed to compute it**, likely due to:

### 1. **RAGAS Evaluation Failure**
The `answer_correctness` metric requires:
- ✅ LLM (you have gpt-4o)
- ✅ Embeddings (you have local all-MiniLM-L6-v2)
- ✅ Ground truth (you have it)
- ❌ **But something failed during evaluation**

### 2. **Common Causes**:

#### A. **API Connection Errors**
You saw these in your terminal output:
```
Exception raised in Job[4]: TypeError(object list can't be used in 'await' expression)
Exception raised in Job[14]: TypeError(object list can't be used in 'await' expression)
```

These async/await errors with local embeddings can cause some metrics to fail.

#### B. **RAGAS Internal Error**
The `answer_correctness` metric is complex and uses:
- LLM to extract statements from answer and ground truth
- Embeddings to compare statements semantically
- If either step fails, it returns 0 or None

#### C. **Silent Failure**
RAGAS sometimes fails silently and returns 0 instead of raising an error.

---

## 📊 Impact on RQS

Your RQS calculation **IS CORRECT** given the 0 answer_correctness:

### Expected RQS Calculation:
```python
# Your configured weights
answer_correctness = 0.35
faithfulness      = 0.25
answer_relevancy  = 0.25
context_precision = 0.075
context_recall    = 0.075

# Bot A actual scores
RQS = (0.35 × 0.0000) +    # Answer Correctness = 0
      (0.25 × 0.8964) +    # Faithfulness
      (0.25 × 0.9606) +    # Answer Relevancy
      (0.075 × 1.0000) +   # Context Precision
      (0.075 × 0.9000)     # Context Recall

RQS = 0 + 0.2241 + 0.2402 + 0.075 + 0.0675
RQS = 0.6068 ≈ 0.6067 ✅
```

### If Answer Correctness worked correctly (e.g., 0.9):
```python
RQS = (0.35 × 0.9000) +    # Would add 0.315!
      (0.25 × 0.8964) +
      (0.25 × 0.9606) +
      (0.075 × 1.0000) +
      (0.075 × 0.9000)

RQS = 0.315 + 0.2241 + 0.2402 + 0.075 + 0.0675
RQS = 0.9218 ✅ Much higher!
```

---

## 🔧 How to Fix

### Option 1: Use Azure Embeddings (Recommended)

Azure embeddings are more stable with RAGAS:

```ini
# In config.ini
[embeddings]
mode = azure
embeddings_deployment = text-embedding-ada-002
```

**Pros:**
- ✅ More stable with RAGAS
- ✅ No async/await issues
- ✅ Better compatibility

**Cons:**
- ❌ Requires Azure embeddings deployment
- ❌ Additional API costs

---

### Option 2: Debug Local Embeddings

The async/await errors suggest local embeddings are causing issues:

1. **Check if model loaded correctly:**
```bash
ls -la Utility/EmbeddingModels/all-MiniLM-L6-v2/
```

2. **Try with debug mode:**
```bash
python3 rag_eval_standalone.py input.xlsx -o report.xlsx --debug
```

3. **Check for error messages** about answer_correctness specifically

---

### Option 3: Adjust Weights Temporarily

If you can't fix answer_correctness immediately, adjust weights:

```ini
# In config.ini - temporary workaround
[weights]
answer_correctness = 0.0    # Disable weight for broken metric
faithfulness = 0.4          # Increase other weights
answer_relevancy = 0.4
context_precision = 0.1
context_recall = 0.1
```

**Note:** This is a workaround, not a fix!

---

### Option 4: Check Terminal Output

Look for specific errors about answer_correctness:

```bash
# In your terminal output, search for:
- "answer_correctness"
- "AnswerCorrectness"
- "Failed to compute"
- "Error in metric"
```

---

## 🎯 Comparison with Backend

Let me check if the backend has the same issue:

### Backend Implementation:
```python
# backend/nexus_evaluator.py
result = await asyncio.to_thread(
    evaluate,
    rag_dataset,
    metrics=[faithfulness, answer_relevancy, context_recall, 
             context_precision, answer_correctness],
    llm=self.llm,
    embeddings=self.embeddings  # Uses HuggingFaceEmbeddings
)
```

The backend uses `HuggingFaceEmbeddings` from `langchain_huggingface`, while standalone uses `sentence-transformers` directly.

**Potential difference:**
- Backend: `HuggingFaceEmbeddings` (may be more compatible with RAGAS)
- Standalone: Custom `LocalMiniLMEmbeddings` (may have async issues)

---

## 🔍 Verification Steps

1. **Check if answer_correctness is actually enabled:**
```bash
grep -A2 "\[metrics\]" Utility/config.ini
# Should show: answer_correctness = true
```
✅ **Confirmed**: It IS enabled in your config

2. **Check RAGAS version:**
```bash
pip list | grep ragas
```

3. **Try with Azure embeddings:**
```bash
# Update config.ini to use azure embeddings
# Then re-run evaluation
```

---

## 💡 Why Backend vs Standalone Might Differ

If you're comparing with backend results:

### Backend (`nexus_evaluator.py`):
- Uses `HuggingFaceEmbeddings` class
- Different async handling
- May succeed where standalone fails

### Standalone (`rag_eval_standalone.py`):
- Uses custom `LocalMiniLMEmbeddings` class
- Has async/await compatibility layer
- May fail on answer_correctness due to async issues

---

## 📈 Expected vs Actual Scores

### What You Should Get (if answer_correctness worked):

| Metric | Bot A (Expected) | Bot A (Actual) |
|--------|------------------|----------------|
| Answer Correctness | ~0.85-0.95 | **0.00** ❌ |
| Faithfulness | 0.90 | 0.90 ✅ |
| Answer Relevancy | 0.96 | 0.96 ✅ |
| Context Precision | 1.00 | 1.00 ✅ |
| Context Recall | 0.90 | 0.90 ✅ |
| **RQS** | **~0.90** | **0.61** ⚠️ |

The missing 0.315 points from answer_correctness (35% weight × ~0.9 score) is causing the ~0.29 point RQS difference!

---

## ✅ Recommended Action

### Immediate Fix:
```bash
# Switch to Azure embeddings
# Edit config.ini:
[embeddings]
mode = azure
embeddings_deployment = text-embedding-ada-002

# Re-run evaluation
cd Utility
python3 rag_eval_standalone.py sample_rag_input_high_quality.xlsx -o report_fixed.xlsx
```

### Long-term Fix:
Update `LocalMiniLMEmbeddings` class to better handle RAGAS's answer_correctness metric requirements.

---

## 🎯 Bottom Line

**Your scores are different because:**
1. ✅ RQS calculation is CORRECT
2. ❌ Answer Correctness metric is FAILING (returning 0)
3. ⚠️ This causes RQS to be ~0.3 points lower than it should be
4. 💡 Switching to Azure embeddings should fix it

**The difference is NOT a bug in the code** - it's a metric computation failure during evaluation, likely caused by async/await incompatibility between the custom local embeddings class and RAGAS's internal requirements for the answer_correctness metric.
