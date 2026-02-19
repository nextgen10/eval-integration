# Metrics Implementation Plan — IMPLEMENTED

## Overview

4-phase evaluation pipeline for JSON comparison with configurable per-field matching strategies.

---

## Definition of "Null"

A value is considered **null** if it is `None`, `""` (empty string), or a whitespace-only string.

```python
def is_null(value) -> bool:
    if value is None:
        return True
    if isinstance(value, str) and value.strip() == "":
        return True
    return False
```

---

## Phase 0 — Key Classification

Every key from the union of GT and AIO is classified into exactly one bucket:

| Bucket | Condition | Used By |
|--------|-----------|---------|
| `extra_keys` | Key in AIO but **not** in GT | Hallucination numerator |
| `gt_null_aio_has_value` | Key in GT, GT value is null, key in AIO, AIO value is **not** null | Hallucination numerator |
| `gt_non_null` | Key in GT and GT value is **not** null | Completeness denominator |
| `aio_missing_or_null` | Key in `gt_non_null` but (key not in AIO or AIO value is null) | Completeness numerator loss |
| `both_non_null` | Key in both GT and AIO, both values are **not** null | Accuracy & Consistency candidates |

### Edge Cases Handled

- Key exists in GT with null value, not in AIO → skipped (no completeness impact, no hallucination)
- Key exists in GT with null value, exists in AIO with null value → skipped
- Key exists in GT with null value, exists in AIO with non-null value → hallucination
- Key not in GT, exists in AIO → hallucination (`extra_keys`)
- Key in GT with non-null value, not in AIO → completeness loss (`aio_missing_or_null`)
- Key in GT with non-null value, AIO has null → completeness loss (`aio_missing_or_null`)

---

## Phase 1 — Completeness

**Formula:**

```
gt_non_null_count = len(gt_non_null)
aio_matched_non_null_count = len(both_non_null)

if gt_non_null_count == 0:
    completeness = 1.0    # nothing expected → fully complete
else:
    completeness = aio_matched_non_null_count / gt_non_null_count
```

**Example:** GT has 50 non-null keys, AIO has 49 of them non-null → `49/50 = 0.98`

---

## Phase 2 — Hallucination

**Formula:**

```
total_distinct = len(gt_keys ∪ aio_keys)
hallucination_count = len(extra_keys) + len(gt_null_aio_has_value)

if total_distinct == 0:
    hallucination = 0.0
else:
    hallucination = hallucination_count / total_distinct
```

**Denominator:** Total distinct keys across GT and AIO regardless of null status.
**Numerator:** Extra keys + keys null in GT but have values in AIO.

---

## Phase 3 — Accuracy

Calculated **only** on `both_non_null` keys, excluding keys with strategy `IGNORE`.

### Strategy Resolution (per-field)

1. Check `field_strategies` config for an explicit override
2. If none, auto-detect from value type:
   - `numeric`, `boolean`, `date`, `email`, `array`, `object` → `EXACT`
   - `text` (any string) → `SEMANTIC`

### Strategy Behaviors

| Strategy | Method | Score |
|----------|--------|-------|
| `EXACT` | `str(gt).lower() == str(aio).lower()` (JSON-sorted for dict/list) | 0 or 1 |
| `FUZZY` | LLM fuzzy similarity → score vs `fuzzy_threshold` | 0 or 1 |
| `SEMANTIC` | LLM semantic similarity → score vs `semantic_threshold` | 0 or 1 |
| `IGNORE` | Field excluded from accuracy denominator entirely | — |

**Formula:**

```
scorable_count = len(both_non_null) - len(ignored)
total_acc_score = sum of individual field scores (0 or 1 each)

if scorable_count == 0:
    accuracy = 1.0    # nothing to score → perfect
else:
    accuracy = total_acc_score / scorable_count
```

---

## Phase 4 — RQS (Response Quality Score)

```
rqs = (w_accuracy × accuracy)
    + (w_completeness × completeness)
    + (w_safety × safety_score)
    - (w_hallucination × hallucination)

rqs = clamp(rqs, 0.0, 1.0)
```

Default weights: `w_accuracy=0.45`, `w_completeness=0.25`, `w_hallucination=0.15`, `w_safety=0.15`

---

## Field Strategy Config File

JSON file mapping field names to strategies. Uploaded or defined in the Configuration page.

```json
{
  "customer_name": "FUZZY",
  "address_line_1": "SEMANTIC",
  "phone_number": "EXACT",
  "internal_notes": "IGNORE",
  "description": "SEMANTIC"
}
```

Valid values: `EXACT`, `FUZZY`, `SEMANTIC`, `IGNORE`

Fields **not** listed in the config will auto-detect their strategy based on value type.

---

## Files Modified

| File | Change |
|------|--------|
| `backend/agent_models_json.py` | Added `field_strategies` to `JsonEvalConfig`, added breakdown fields to `JsonEvalResult` |
| `backend/utils/matching_strategies.py` | Rewrote with `is_null()`, `resolve_strategy()`, strategy-based `calculate_similarity()` |
| `backend/agents/json_evaluator_agent.py` | Full 4-phase pipeline rewrite |
| `backend/agent_models.py` | Added `field_strategies` to `TestRequest`, `JsonEvaluationRequest`, `BatchPathRequest` |
| `backend/agents/orchestrator_agent.py` | Passes `field_strategies` into `JsonEvalConfig` |
| `backend/agent_router.py` | Threads `field_strategies` through all endpoints |
| `frontend/.../configuration/page.tsx` | New Field Strategy Config section (add/remove/import/export) |
| `frontend/.../test-evaluations/page.tsx` | Reads `field_strategies` from localStorage and sends with API calls |

---

## Walkthrough Example

**GT:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "bio": "Senior engineer with 10 years of experience...",
  "internal_id": null,
  "status": "active"
}
```

**AIO:**
```json
{
  "name": "John Smyth",
  "email": "john@example.com",
  "bio": "Experienced senior engineer, 10+ years...",
  "internal_id": "abc123",
  "extra_field": "surprise"
}
```

**Config:** `{ "name": "FUZZY", "bio": "SEMANTIC" }`

### Classification:
- `gt_non_null`: `[name, email, bio, status]` (4 keys)
- `both_non_null`: `[name, email, bio]` (3 keys — status missing from AIO)
- `aio_missing_or_null`: `[status]` (1 key)
- `extra_keys`: `[extra_field]` (1 key)
- `gt_null_aio_has_value`: `[internal_id]` (GT is null, AIO has "abc123")

### Completeness:
`3 / 4 = 0.75`

### Hallucination:
Total distinct keys = 6 (`name, email, bio, internal_id, status, extra_field`)
Hallucination count = 2 (`extra_field` + `internal_id`)
`2 / 6 = 0.333`

### Accuracy (on `both_non_null` = `[name, email, bio]`):
- `name`: FUZZY (from config) → "John Smith" vs "John Smyth" → LLM score 0.92 ≥ 0.85 → **1.0**
- `email`: EXACT (auto-detect email type) → exact match → **1.0**
- `bio`: SEMANTIC (from config) → LLM score 0.88 ≥ 0.80 → **1.0**
- Accuracy = `3/3 = 1.0`

### RQS:
`(0.45 × 1.0) + (0.25 × 0.75) + (0.15 × 1.0) - (0.15 × 0.333) = 0.45 + 0.1875 + 0.15 - 0.05 = 0.7375`
