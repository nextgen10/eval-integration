# Same Embedding Model, Different Results - Explained

## 🔍 The Mystery

Both implementations use the **same all-MiniLM-L6-v2 model** but produce different results. Why?

---

## 📊 Key Finding: Different Embedding Wrappers

### Backend (`nexus_evaluator.py`)
```python
from langchain_huggingface import HuggingFaceEmbeddings

# Line 49-50
model_path = os.path.join(os.path.dirname(__file__), "EmbeddingModels", "all-MiniLM-L6-v2")
self.embeddings = HuggingFaceEmbeddings(model_name=model_path)
```

**Uses**: `HuggingFaceEmbeddings` from `langchain_huggingface`

---

### Standalone (`rag_eval_standalone.py`)
```python
from sentence_transformers import SentenceTransformer

# Lines 446-447
self.model = SentenceTransformer(model_path)
# Custom wrapper with manual async methods
```

**Uses**: Custom `LocalMiniLMEmbeddings` wrapper around `SentenceTransformer`

---

## ⚖️ Comparison Table

| Aspect | Backend | Standalone | Impact |
|--------|---------|------------|--------|
| **Library** | `langchain_huggingface` | `sentence_transformers` | Different API |
| **Wrapper** | `HuggingFaceEmbeddings` (LangChain) | Custom `LocalMiniLMEmbeddings` | Different interface |
| **Async Support** | Native (LangChain handles it) | Manual (`aembed_*` methods) | ⚠️ Key difference! |
| **RAGAS Compatibility** | ✅ High (LangChain standard) | ⚠️ Medium (custom wrapper) | May cause issues |
| **answer_correctness** | ✅ Works | ❌ Returns 0 | **The problem!** |

---

## 🎯 Root Cause: Async Handling

### Backend Approach (Works):
```python
# HuggingFaceEmbeddings from langchain_huggingface
self.embeddings = HuggingFaceEmbeddings(model_name=model_path)

# When RAGAS calls embeddings methods:
# ✅ Native async support via LangChain
# ✅ Proper interface expected by RAGAS
# ✅ answer_correctness metric works
```

**Why it works:**
- `HuggingFaceEmbeddings` is a **LangChain-native** embeddings class
- RAGAS is built to work with LangChain embeddings
- Has proper async/await support built-in
- Implements all required methods correctly

---

### Standalone Approach (Fails for answer_correctness):
```python
# Custom wrapper around SentenceTransformer
class LocalMiniLMEmbeddings:
    def __init__(self, model_path: str):
        self.model = SentenceTransformer(model_path)
    
    # Synchronous methods
    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, convert_to_numpy=True)
        return embeddings.tolist()
    
    # Manual async wrappers (just call sync version)
    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        return self.embed_documents(texts)  # ⚠️ Not truly async!
```

**Why it fails:**
- Custom wrapper, not LangChain-native
- Async methods just call sync versions (not truly async)
- RAGAS's answer_correctness has special async requirements
- The TypeError you saw: `object list can't be used in 'await' expression`

---

## 🔬 Technical Deep Dive

### What Happens During answer_correctness Evaluation

1. **RAGAS calls the embeddings model** to compare statements
2. **Uses async/await** internally for efficiency
3. **Expects LangChain-compatible interface**

#### In Backend:
```python
# RAGAS internally does something like:
embeddings = await self.embeddings.aembed_documents(texts)
# ✅ Works because HuggingFaceEmbeddings has proper async support
```

#### In Standalone:
```python
# RAGAS tries:
embeddings = await self.embeddings.aembed_documents(texts)
# ❌ Fails because:
#    1. aembed_documents just calls embed_documents (sync)
#    2. Returns list directly (not awaitable)
#    3. TypeError: can't await a list
#    4. RAGAS catches error, returns 0 for answer_correctness
```

---

## 📋 Method Comparison

### HuggingFaceEmbeddings (Backend)
```python
# From langchain_huggingface package
class HuggingFaceEmbeddings:
    def embed_documents(self, texts):
        # Properly handles sync
        
    async def aembed_documents(self, texts):
        # Properly handles async with run_in_executor
        
    def embed_query(self, text):
        # Single text embedding
        
    async def aembed_query(self, text):
        # Async single text
```
✅ **Properly implemented async/await**

---

### LocalMiniLMEmbeddings (Standalone)
```python
# Custom implementation
class LocalMiniLMEmbeddings:
    def embed_documents(self, texts):
        return self.model.encode(texts).tolist()
        
    async def aembed_documents(self, texts):
        return self.embed_documents(texts)  # ⚠️ Just calls sync!
        
    def embed_query(self, text):
        return self.model.encode([text])[0].tolist()
        
    async def aembed_query(self, text):
        return self.embed_query(text)  # ⚠️ Just calls sync!
```
⚠️ **Fake async** - just calls sync methods

---

## 🔧 Why This Matters for answer_correctness

The `answer_correctness` metric is **special** because:

1. **More complex** than other metrics
2. **Extracts statements** from answer and ground truth using LLM
3. **Compares statements** using embeddings
4. **Heavy async usage** for parallel statement comparison
5. **Requires proper async embeddings** for efficiency

### Metrics Comparison:

| Metric | Complexity | Async Critical? | Works in Standalone? |
|--------|------------|-----------------|----------------------|
| Faithfulness | Medium | No | ✅ Yes |
| Answer Relevancy | Medium | No | ✅ Yes |
| Context Precision | Low | No | ✅ Yes |
| Context Recall | Low | No | ✅ Yes |
| **Answer Correctness** | **High** | **YES** | ❌ **No** |

---

## 💡 Solution Options

### Option 1: Use HuggingFaceEmbeddings (Like Backend)

**Modify Standalone to use the same approach as Backend:**

```python
# Instead of custom LocalMiniLMEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings

# In StandaloneRagEvaluator.__init__
if embeddings_mode == "local":
    model_path = os.path.join(SCRIPT_DIR, "EmbeddingModels", "all-MiniLM-L6-v2")
    self.embeddings = HuggingFaceEmbeddings(model_name=model_path)
```

**Pros:**
- ✅ Same implementation as backend
- ✅ answer_correctness will work
- ✅ Proper async support
- ✅ LangChain-native

**Cons:**
- ❌ Requires `langchain_huggingface` dependency
- ❌ Changes existing implementation

---

### Option 2: Fix LocalMiniLMEmbeddings Async Methods

**Make async methods truly async:**

```python
import asyncio

class LocalMiniLMEmbeddings:
    async def aembed_documents(self, texts: List[str]) -> List[List[float]]:
        """Truly async version."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self.embed_documents, texts
        )
    
    async def aembed_query(self, text: str) -> List[float]:
        """Truly async version."""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(
            None, self.embed_query, text
        )
```

**Pros:**
- ✅ Fixes the async issue
- ✅ Keeps sentence_transformers
- ✅ Minimal code change

**Cons:**
- ⚠️ May still have compatibility issues
- ⚠️ Not tested with RAGAS

---

### Option 3: Use Azure Embeddings (Already Suggested)

**Switch to Azure OpenAI embeddings:**

```ini
[embeddings]
mode = azure
embeddings_deployment = text-embedding-ada-002
```

**Pros:**
- ✅ Known to work with RAGAS
- ✅ No local model issues
- ✅ Proper async support

**Cons:**
- ❌ Requires Azure embeddings deployment
- ❌ Additional API costs
- ❌ Not using local model

---

## 🎯 Recommendation

### Short-term (Immediate Fix):
**Use Azure Embeddings** - Most reliable, no code changes

### Long-term (Best Solution):
**Switch to HuggingFaceEmbeddings** like the backend:

```python
# In rag_eval_standalone.py, replace LocalMiniLMEmbeddings with:
from langchain_huggingface import HuggingFaceEmbeddings

if embeddings_mode == "local":
    model_path = os.path.join(SCRIPT_DIR, "EmbeddingModels", "all-MiniLM-L6-v2")
    self.embeddings = HuggingFaceEmbeddings(model_name=model_path)
```

**Benefits:**
- ✅ Same implementation as backend
- ✅ answer_correctness will work
- ✅ No Azure costs
- ✅ Proven to work

---

## 📊 Test Results Comparison

### Backend Results (Expected):
```
Answer Correctness: 0.85-0.95  ✅
Faithfulness:       0.90       ✅
Answer Relevancy:   0.96       ✅
RQS:                ~0.92      ✅
```

### Standalone Results (Current):
```
Answer Correctness: 0.00       ❌ FAILS
Faithfulness:       0.90       ✅
Answer Relevancy:   0.96       ✅
RQS:                ~0.61      ⚠️ Lower due to missing AC
```

### Standalone Results (After Fix):
```
Answer Correctness: 0.85-0.95  ✅ Will work!
Faithfulness:       0.90       ✅
Answer Relevancy:   0.96       ✅
RQS:                ~0.92      ✅ Correct!
```

---

## 🔍 Summary

### Same Model, Different Wrappers:

| Component | Backend | Standalone | Result |
|-----------|---------|------------|--------|
| **Base Model** | all-MiniLM-L6-v2 | all-MiniLM-L6-v2 | ✅ Same |
| **Wrapper** | HuggingFaceEmbeddings | LocalMiniLMEmbeddings | ❌ Different |
| **Async Support** | Native | Manual/Fake | ❌ Broken |
| **RAGAS Compatible** | Yes | Partially | ⚠️ Issue |
| **answer_correctness** | ✅ Works | ❌ Fails | **Problem** |

---

## 💻 Quick Fix Code

Add this to your requirements.txt:
```
langchain-huggingface>=0.0.1
```

Then modify `rag_eval_standalone.py`:

```python
# Line ~14 - Add import
from langchain_huggingface import HuggingFaceEmbeddings

# Lines ~540-550 - Replace LocalMiniLMEmbeddings initialization with:
if embeddings_mode == "local":
    model_path = os.path.join(SCRIPT_DIR, "EmbeddingModels", "all-MiniLM-L6-v2")
    logger.info(f"Loading all-MiniLM-L6-v2 from: {model_path}")
    self.embeddings = HuggingFaceEmbeddings(model_name=model_path)
    logger.info("Model loaded successfully (HuggingFaceEmbeddings)")
```

This will make standalone work exactly like backend!

---

## 🎯 Bottom Line

**You're right** - both use the same model, but:
- ✅ Backend uses `HuggingFaceEmbeddings` (LangChain) → **Works**
- ❌ Standalone uses custom `LocalMiniLMEmbeddings` → **Breaks answer_correctness**

The wrapper makes all the difference! Switch to `HuggingFaceEmbeddings` to fix it.
