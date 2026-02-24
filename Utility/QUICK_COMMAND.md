# Quick Command Reference - v1.2.0

## 🎯 Single Command - Everything Generated

```bash
cd Utility
python3 rag_eval_standalone.py input.xlsx -o report.xlsx
```

## 📊 What Gets Generated (7 files)

| File | Description | Size |
|------|-------------|------|
| `report.xlsx` | Excel with 3 sheets | ~12 KB |
| `report_per_query_metrics.json` | Per-query details | ~19 KB |
| `report_bot_summary.json` | Bot summaries | ~1 KB |
| `report_leaderboard.json` | Rankings | ~1 KB |
| `report_complete.json` | All sheets | ~23 KB |
| `report_comprehensive.json` ⭐ | **EVERYTHING** | ~38 KB |

## ⭐ Comprehensive JSON Contains

```
✓ metadata          - Timestamps, version, settings
✓ input_data        - Original queries, ground truth, responses, contexts
✓ evaluation_results - All metrics from all sheets
✓ configuration     - All config.ini settings
✓ summary           - Winner, per-bot stats, issues
```

## 🚀 Usage Examples

### Standard Evaluation
```bash
python3 rag_eval_standalone.py sample_rag_input_high_quality.xlsx -o my_report.xlsx
```

### With Debug
```bash
python3 rag_eval_standalone.py input.xlsx -o report.xlsx --debug
```

### With Cache
```bash
python3 rag_eval_standalone.py input.xlsx -o report.xlsx --cache
```

## 💡 Which JSON to Use?

| Use Case | Recommended File |
|----------|------------------|
| **Complete package** (input + output + config) | `report_comprehensive.json` ⭐ |
| **Quick results** (just metrics) | `report_complete.json` |
| **Per-query analysis** | `report_per_query_metrics.json` |
| **Bot comparison** | `report_bot_summary.json` |
| **Rankings only** | `report_leaderboard.json` |

## 📚 Documentation

- `UPDATE_v1.2.0.md` - What's new in v1.2.0
- `COMPREHENSIVE_JSON_GUIDE.md` - JSON structure guide
- `QUICK_START.md` - Getting started
- `COMMAND_REFERENCE.md` - All commands

---

**Version**: 1.2.0  
**Feature**: Auto comprehensive JSON generation  
**Command**: `python3 rag_eval_standalone.py input.xlsx -o report.xlsx`
