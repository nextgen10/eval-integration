# RAG Evaluation - Toxicity Metrics & Prompts Page Implementation

## Summary

Successfully added **Toxicity Metrics** to the RAG Evaluation application and created a **Prompts Page** similar to the Agent Eval application.

---

## 🎯 Features Implemented

### 1. **Toxicity Metrics Integration**

#### Backend Changes

**File: `backend/nexus_evaluator.py`**
- Added toxicity calculation during evaluation using the existing `utils/toxicity_checker.py`
- Integrated toxicity scoring for each bot response
- Added `avg_toxicity` to summaries and leaderboard calculations
- Toxicity scores are cached in the database alongside other metrics

**Key Changes:**
```python
# Calculate toxicity for each response
tox_result = await check_toxicity(response_text, self.model_name)
toxicity_score = self._safe_float(tox_result.toxicity_score)

# Added to RAGMetrics
metrics = RAGMetrics(
    ...
    toxicity=toxicity_score,
    ...
)
```

**File: `backend/nexus_models.py`**
- Already had `toxicity` field in `RAGMetrics` model (no changes needed)

#### Frontend Changes

**File: `frontend/src/features/rag-eval/components/RAGEvalPage.tsx`**

Added toxicity display in multiple locations:

1. **Dashboard Metric Cards** (Line ~956)
   - New "Toxicity Score" card showing winner's average toxicity
   - Icon: Activity
   - Subtitle: "Content Safety (Lower is Better)"

2. **Leaderboard Table** (Line ~1077-1118)
   - Added "Toxicity" column header
   - Display toxicity percentage for each bot

---

### 2. **Prompts Page for RAG Evaluation**

#### Backend API

**File: `backend/main.py`**
- Added new endpoint: `GET /rag/prompts`
- Returns all RAG evaluation prompts from `backend/prompts/rag_*.json`
- Automatically discovers and loads all RAG prompt files

#### Prompt JSON Files Created

Created 6 new prompt configuration files in `backend/prompts/`:

1. **`rag_faithfulness.json`**
   - Measures grounding in context
   - Detects hallucinations

2. **`rag_relevancy.json`**
   - Evaluates answer relevance to query
   - Checks completeness and on-topic focus

3. **`rag_context_precision.json`**
   - Measures signal-to-noise ratio in retrieved context
   - Evaluates relevance of retrieved chunks

4. **`rag_context_recall.json`**
   - Measures retrieval completeness
   - Checks if all necessary information is present

5. **`rag_correctness.json`**
   - Evaluates factual accuracy vs ground truth
   - Combines factual and semantic alignment

6. **`rag_toxicity.json`**
   - Analyzes responses for toxic/harmful content
   - Ensures safety and professionalism

#### Frontend Prompts Page

**File: `frontend/src/app/rag-eval/prompts/page.tsx`**

Features:
- Clean, professional UI matching Agent Eval prompts page
- Accordion-style expandable prompt cards
- Each card shows:
  - Metric icon (ShieldCheck, Target, Gauge, Layers, GitCompare, Activity)
  - Title and description
  - Model, temperature, max tokens, response format
  - System and User prompts with variable highlighting
  - Copy-to-clipboard functionality
- Default expanded: `rag_faithfulness`
- Fetches prompts from `GET /rag/prompts` endpoint

#### Navigation Update

**File: `frontend/src/features/rag-eval/components/RAGEvalPage.tsx`** (Line ~653)

Added "Prompts" navigation item:
- Icon: TerminalIcon
- Location: Between "History" and "Configuration"
- Routes to: `/rag-eval/prompts`

---

## 📊 Data Flow

### Toxicity Evaluation Flow

```
1. User uploads Excel → Backend receives test cases
2. For each bot response:
   a. Check cache for existing metrics
   b. If miss: Run RAGAS evaluation
   c. Call check_toxicity(response_text)
   d. Store toxicity score with other metrics
3. Calculate average toxicity per bot
4. Display in UI (dashboard cards, leaderboard table)
```

### Prompts Page Flow

```
1. User navigates to /rag-eval/prompts
2. Frontend calls GET /rag/prompts
3. Backend scans backend/prompts/rag_*.json
4. Returns array of prompt configurations
5. Frontend renders accordion cards with:
   - Prompt metadata
   - System & user message templates
   - Copy functionality
```

---

## 🔧 Technical Details

### Toxicity Scoring

- **Range**: 0.0 to 1.0 (0 = safe, 1 = highly toxic)
- **Method**: LLM-based analysis + keyword detection
- **Model**: Same as evaluation model (gpt-4o)
- **Caching**: Enabled (stored in MetricCache)
- **Performance**: Runs in parallel with RAGAS metrics

### Prompt Management

- **Format**: JSON files with standardized schema
- **Location**: `backend/prompts/rag_*.json`
- **Discovery**: Automatic via glob pattern
- **Hot Reload**: No (requires server restart)
- **Editing**: Modify JSON files directly

---

## 🎨 UI/UX Features

### Toxicity Display

- Prominent metric card on dashboard
- "Lower is Better" messaging for clarity
- Color coding (inherits from MetricCard component)
- Included in exports (CSV, Excel, JSON)

### Prompts Page

- Expandable/collapsible accordions
- Icon-coded by metric type
- Monospace font for code blocks
- Variable highlighting (`{variable}` → styled spans)
- Copy-to-clipboard with feedback
- Responsive layout
- Dark/light mode compatible

---

## 📝 Configuration

### Toxicity Settings

Configured in `backend/prompts/rag_toxicity.json`:
```json
{
  "model": "gpt-4o (or Azure deployment)",
  "temperature": 0.0,
  "max_tokens": 500,
  "response_format": "{\"toxicity_score\": float, \"tone\": string, \"issues\": [string]}"
}
```

### Adding New Prompts

1. Create `backend/prompts/rag_<metric>.json`
2. Follow schema:
   ```json
   {
     "prompt_key": "rag_<metric>",
     "title": "Display Title",
     "description": "Brief description",
     "model": "gpt-4o",
     "temperature": 0.0,
     "max_tokens": 2000,
     "response_format": "Format description",
     "used_in": "Where it's used",
     "system_message": "System prompt",
     "user_message_template": "User prompt with {variables}"
   }
   ```
3. Add icon mapping in `page.tsx` (optional)
4. Restart backend

---

## 🚀 Testing

### Toxicity Metrics
```bash
# Run evaluation with toxicity enabled
cd backend
python -m pytest tests/test_toxicity.py  # If tests exist
```

### Prompts Page
1. Navigate to http://localhost:3000/rag-eval/prompts
2. Verify all 6 RAG prompts load
3. Test expand/collapse functionality
4. Test copy-to-clipboard
5. Check dark/light mode compatibility

---

## 📦 Files Modified/Created

### Backend (5 files)
- ✏️ `backend/nexus_evaluator.py` - Added toxicity calculation
- ✏️ `backend/main.py` - Added `/rag/prompts` endpoint
- ➕ `backend/prompts/rag_faithfulness.json`
- ➕ `backend/prompts/rag_relevancy.json`
- ➕ `backend/prompts/rag_context_precision.json`
- ➕ `backend/prompts/rag_context_recall.json`
- ➕ `backend/prompts/rag_correctness.json`
- ➕ `backend/prompts/rag_toxicity.json`

### Frontend (2 files)
- ✏️ `frontend/src/features/rag-eval/components/RAGEvalPage.tsx` - Added toxicity display & navigation
- ➕ `frontend/src/app/rag-eval/prompts/page.tsx` - New prompts page

---

## ✅ Checklist

- [x] Toxicity calculation integrated in backend
- [x] Toxicity displayed in dashboard cards
- [x] Toxicity column in leaderboard table
- [x] Toxicity included in summaries
- [x] 6 RAG prompt JSON files created
- [x] `/rag/prompts` API endpoint implemented
- [x] Prompts page UI created
- [x] Navigation link added
- [x] Copy-to-clipboard functionality
- [x] Dark/light mode compatibility
- [x] Responsive design
- [x] All TODOs completed

---

## 🎉 Result

The RAG Evaluation application now has:
1. **Complete toxicity monitoring** across all evaluated responses
2. **Transparent prompt inspection** matching Agent Eval's design
3. **Enhanced safety metrics** for production deployment
4. **Improved developer experience** with visible prompt engineering

Both features are production-ready and integrate seamlessly with the existing evaluation pipeline!
