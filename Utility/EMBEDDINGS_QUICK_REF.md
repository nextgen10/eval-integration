# Embeddings Mode Quick Reference

## Current Configuration
```ini
mode = local  # ← Edit this line to switch modes
```

## Two Modes

| Mode | Model | Location | Cost | Setup |
|------|-------|----------|------|-------|
| **local** | all-MiniLM-L6-v2 | Your machine | Free | pip install |
| **azure** | Azure embeddings | Cloud | $$ | Azure deployment |

## Quick Switch

### Local Mode (Default)
```ini
[embeddings]
mode = local
```
✅ Uses `./EmbeddingModels/all-MiniLM-L6-v2`  
✅ Free, fast, offline-capable  
⚠️ Requires: `pip install sentence-transformers`

### Azure Mode
```ini
[embeddings]
mode = azure
embeddings_deployment = text-embedding-ada-002
```
✅ Production-grade quality  
✅ Scalable cloud infrastructure  
⚠️ Requires: Azure embeddings deployment  
⚠️ API costs per call

## That's It!
Edit `config.ini` → Run evaluation → Done! 🎉

## Model Dimensions
- **Local**: 384 dimensions (all-MiniLM-L6-v2)
- **Azure**: 1536 dimensions (text-embedding-ada-002)

Both provide high-quality semantic embeddings for RAG evaluation!
