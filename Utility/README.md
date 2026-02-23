# RAG Eval — Standalone CLI Utility

A standalone command-line tool for evaluating RAG (Retrieval-Augmented Generation) pipelines. It reads an Excel input file, runs RAGAS metrics against Azure OpenAI, and generates a multi-sheet Excel report with scores, rankings, and diagnostics.

---

## Features

- **5 RAGAS Metrics** — Faithfulness, Answer Relevancy, Context Precision, Context Recall, Answer Correctness (each individually toggleable)
- **LLM-Only Evaluation** — Uses Azure OpenAI for all metrics, no embedding models required
- **LLM-based Toxicity Scoring** — Detects toxic/harmful input queries using LLM classification
- **LLM-generated Recommendations** — Provides actionable suggestions for improving each response
- **Dynamic Bot Support** — Automatically discovers any number of bots from Excel columns (`Bot_A`, `Bot_B`, `Bot_GPT4`, etc.)
- **Multi-Chunk Context** — Supports JSON arrays, `||` delimiters, or newline-separated context chunks
- **RQS Scoring** — Composite Response Quality Score with configurable, auto-normalized weights
- **Parallel Evaluation** — Concurrent bot evaluation via thread pool for faster runs
- **Evaluation Caching** — Hash-based caching to avoid recomputing metrics on repeated runs
- **Failure Diagnostics** — Automatic classification into Retrieval Failure, Hallucination, or Low Quality
- **Conditional Formatting** — Metric cells below threshold are highlighted red in the Excel report
- **Fully Configurable** — All settings driven by `config.ini`; CLI args override where supported

---

## Quick Start

### 1. Install Dependencies

```bash
cd Utility
pip install -r requirements.txt
```

### 2. Configure Azure OpenAI

Edit `config.ini` and set your Azure OpenAI credentials:

```ini
[azure]
endpoint = https://your-resource.openai.azure.com/
api_key = your-api-key-here
api_version = 2024-12-01-preview
deployment = gpt-4o
temperature = 0.0
```

Alternatively, set environment variables:
- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_API_VERSION`

The script also checks `backend/.env` as a fallback.

### 3. Prepare Input Excel

Create an Excel file with the following column structure:

| Query | Ground_Truth | Bot_A | Bot_B | Context |
|-------|-------------|-------|-------|---------|
| What is RAG? | RAG combines retrieval with generation... | RAG is a technique... | RAG stands for... | Retrieved passage about RAG... |

**Required columns:**
- **Query** (or `Question`, `Input`, `Prompt`) — the user question
- **Bot_\*** — one or more bot response columns (prefix configurable via `config.ini`)

**Optional columns:**
- **Ground_Truth** (or `Reference`, `Target`, `GT`, `Expected`) — reference answer for correctness metrics
- **Context** — shared context for all bots, or per-bot contexts (see below)

### 4. Run

```bash
python3 rag_eval_standalone.py input.xlsx -o report.xlsx
```

---

## Input Excel Formats

The tool supports flexible column layouts. Bots are discovered dynamically — use 1, 2, 5, or any number.

### Single Bot

| Query | Ground_Truth | Bot_MyApp | Context |
|-------|-------------|-----------|---------|

### Multiple Bots with Shared Context

| Query | Ground_Truth | Bot_GPT4 | Bot_Claude | Bot_Gemini | Context |
|-------|-------------|----------|------------|------------|---------|

### Multiple Bots with Per-Bot Context

| Query | Ground_Truth | Bot_GPT4 | Context_GPT4 | Bot_Claude | Context_Claude |
|-------|-------------|----------|--------------|------------|----------------|

### Multi-Chunk Context (in a single cell)

The Context cell supports multiple formats:

```
JSON array:     ["chunk 1", "chunk 2", "chunk 3"]
Pipe-delimited: chunk 1 || chunk 2 || chunk 3
Newline-separated (double newline between chunks)
```

The delimiter is auto-detected by default, or set explicitly in `config.ini`:

```ini
[context]
delimiter = auto    ; auto | || | \n | <custom>
```

### No Ground Truth

Ground truth is optional. If omitted, `context_recall` and `answer_correctness` metrics are automatically skipped.

---

## Output Report

The generated Excel report contains three sheets:

### Sheet 1: Per-Query Metrics

| Column | Description |
|--------|-------------|
| Query | Input question |
| Ground Truth | Reference answer |
| Bot | Bot identifier |
| Response | Bot's response |
| Context | Retrieved context chunks |
| RQS | Response Quality Score (weighted composite) |
| Answer Correctness | LLM-judged correctness vs ground truth |
| Faithfulness | How grounded the answer is in the context |
| Answer Relevancy | How relevant the answer is to the query |
| Context Precision | Relevance of retrieved context |
| Context Recall | Completeness of retrieved context |
| Input Toxicity | Toxicity score of the query (0.0–1.0) |
| Toxic? | YES/No flag based on threshold |
| Empty Context? | Flag if context was empty |
| Empty Answer? | Flag if answer was empty |
| Failure Mode | Diagnostic classification (see below) |
| Recommendation | LLM-generated actionable suggestion for improvement |

Metric cells scoring below their configured threshold are **highlighted in red**.

### Sheet 2: Bot Summary

Aggregated averages per bot — RQS, all metric averages, toxicity stats, and failure counts.

### Sheet 3: Leaderboard

Ranked by average RQS with standard deviation for stability signals. The winner is marked with a star.

---

## Failure Mode Classification

Each query-bot pair is classified based on metric thresholds:

| Failure Mode | Trigger Condition | What It Means |
|-------------|------------------|---------------|
| **Retrieval Failure** | `context_recall` < threshold AND `context_precision` < threshold | The RAG retrieval step failed to find relevant context |
| **Hallucination** | `faithfulness` < threshold | The LLM fabricated information not present in the context |
| **Low Quality** | `answer_relevancy` < threshold OR `answer_correctness` < threshold | The answer is off-topic or incorrect despite adequate retrieval |
| **OK** | All metrics above thresholds | No issues detected |

A single query can have multiple flags (e.g., `Retrieval Failure | Hallucination`).

---

## RQS (Response Quality Score)

The composite quality score is calculated as a weighted sum:

```
RQS = w_ac * Answer Correctness
    + w_f  * Faithfulness
    + w_ar * Answer Relevancy
    + w_cp * Context Precision
    + w_cr * Context Recall
```

Default weights (auto-normalized to sum to 1.0):

| Metric | Weight |
|--------|--------|
| Answer Correctness | 0.35 |
| Faithfulness | 0.25 |
| Answer Relevancy | 0.25 |
| Context Precision | 0.075 |
| Context Recall | 0.075 |

Override via `config.ini` or CLI:

```bash
python3 rag_eval_standalone.py input.xlsx --alpha 0.5 --beta 0.3 --gamma 0.2
```

Where `--alpha` = answer_correctness, `--beta` = faithfulness, `--gamma` = answer_relevancy.

---

## CLI Reference

```
usage: rag_eval_standalone.py [-h] [-o OUTPUT] [--config CONFIG]
                               [--alpha ALPHA] [--beta BETA] [--gamma GAMMA]
                               [--model MODEL] [--temperature TEMPERATURE]
                               [--debug]
                               input

positional arguments:
  input                 Path to input Excel file

options:
  -o, --output          Output Excel report path (default: <input>_report.xlsx)
  --config              Path to config.ini (default: ./config.ini)
  --alpha               Weight for answer_correctness (overrides config)
  --beta                Weight for faithfulness (overrides config)
  --gamma               Weight for answer_relevancy (overrides config)
  --model               Azure OpenAI deployment name (overrides config)
  --temperature         LLM temperature (overrides config)
  --debug               Enable debug logging
```

### Examples

```bash
# Basic run
python3 rag_eval_standalone.py data.xlsx

# Custom output path
python3 rag_eval_standalone.py data.xlsx -o results.xlsx

# Custom weights
python3 rag_eval_standalone.py data.xlsx --alpha 0.5 --beta 0.25 --gamma 0.25

# Debug mode (verbose logging)
python3 rag_eval_standalone.py data.xlsx --debug

# Custom config file
python3 rag_eval_standalone.py data.xlsx --config my_config.ini

# Different model
python3 rag_eval_standalone.py data.xlsx --model gpt-4o-mini
```

---

## Configuration Reference

All settings are in `config.ini`. Here is every section and key:

### `[azure]` — Azure OpenAI Credentials

| Key | Default | Description |
|-----|---------|-------------|
| `endpoint` | *(env var)* | Azure OpenAI endpoint URL |
| `api_key` | *(env var)* | Azure OpenAI API key |
| `api_version` | `2024-12-01-preview` | API version |
| `deployment` | `gpt-4o` | Model deployment name |
| `temperature` | `0.0` | LLM temperature |

### `[weights]` — RQS Scoring Weights

| Key | Default | Description |
|-----|---------|-------------|
| `answer_correctness` | `0.35` | Weight for answer correctness |
| `faithfulness` | `0.25` | Weight for faithfulness |
| `answer_relevancy` | `0.25` | Weight for answer relevancy |
| `context_precision` | `0.075` | Weight for context precision |
| `context_recall` | `0.075` | Weight for context recall |

All weights are auto-normalized to sum to 1.0.

### `[metrics]` — Enable/Disable Metrics

| Key | Default | Description |
|-----|---------|-------------|
| `faithfulness` | `true` | Enable faithfulness metric |
| `answer_relevancy` | `true` | Enable answer relevancy metric |
| `context_precision` | `true` | Enable context precision metric |
| `context_recall` | `true` | Enable context recall metric |
| `answer_correctness` | `true` | Enable answer correctness metric |
| `toxicity` | `true` | Enable LLM-based toxicity scoring |

### `[thresholds]` — Failure Mode Thresholds

| Key | Default | Description |
|-----|---------|-------------|
| `faithfulness` | `0.3` | Below this triggers "Hallucination" |
| `answer_relevancy` | `0.3` | Below this triggers "Low Quality" |
| `context_precision` | `0.3` | Below this (with recall) triggers "Retrieval Failure" |
| `context_recall` | `0.3` | Below this (with precision) triggers "Retrieval Failure" |
| `answer_correctness` | `0.3` | Below this triggers "Low Quality" |

Scores below these thresholds are also **highlighted red** in the Excel report.

### `[toxicity]` — Toxicity Detection

| Key | Default | Description |
|-----|---------|-------------|
| `threshold` | `0.5` | Queries scoring >= this are flagged toxic |
| `deployment` | *(main LLM)* | Optional separate (cheaper) LLM for toxicity |

### `[context]` — Context Parsing

| Key | Default | Description |
|-----|---------|-------------|
| `delimiter` | `auto` | `auto`, `||`, `\n`, or any custom delimiter |

### `[bots]` — Bot Column Detection

| Key | Default | Description |
|-----|---------|-------------|
| `strip_prefix` | `Bot_` | Prefix to strip from column names for bot IDs |

### `[diagnostics]` — Failure Diagnostics

| Key | Default | Description |
|-----|---------|-------------|
| `enabled` | `true` | Add diagnostic columns to the report |

### `[cache]` — Evaluation Caching

| Key | Default | Description |
|-----|---------|-------------|
| `enabled` | `false` | Enable hash-based metric caching |
| `directory` | `.nexus_cache` | Cache storage directory |

Cache key includes: query + answer + context + ground_truth + model + temperature.

### `[evaluation]` — Evaluation Settings

| Key | Default | Description |
|-----|---------|-------------|
| `max_rows` | `200` | Maximum rows to process (safety guard) |
| `parallel` | `true` | Evaluate bots in parallel |
| `max_workers` | `2` | Maximum parallel threads |

---

## File Structure

```
Utility/
  rag_eval_standalone.py   # Main evaluation script
  config.ini               # Configuration (gitignored — contains credentials)
  requirements.txt         # Python dependencies
  sample_rag_input.xlsx    # Sample input with 20 queries and 2 bots
  README.md                # This documentation
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Azure OpenAI credentials not found` | Set `endpoint` and `api_key` in `config.ini` or as environment variables |
| `No Bot_* columns found` | Ensure response columns use the `Bot_` prefix (or change `strip_prefix` in config) |
| `No Query column found` | Name your query column as `Query`, `Question`, `Input`, or `Prompt` |
| RAGAS deprecation warnings | Harmless — suppressed automatically; will resolve when upgrading to RAGAS v1.0 |
| Slow evaluation | Enable caching (`[cache] enabled = true`) for repeated runs; reduce `max_rows` for testing |
