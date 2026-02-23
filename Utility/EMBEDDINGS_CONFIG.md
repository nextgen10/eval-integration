# Embeddings Configuration Guide

The RAG evaluation tool supports two embeddings modes.

## Configuration

Edit the `[embeddings]` section in `config.ini`:

```ini
[embeddings]
mode = local
embeddings_deployment = text-embedding-ada-002
```

## Two Modes

### 1. Local Mode (Default)
**Configuration**: `mode = local`

Uses the pre-installed **all-MiniLM-L6-v2** model from `./EmbeddingModels/all-MiniLM-L6-v2`.

**Pros:**
- ✅ Real semantic embeddings (384 dimensions)
- ✅ No Azure embeddings deployment needed
- ✅ Runs entirely locally on your machine
- ✅ Zero API costs for embeddings
- ✅ Fast and accurate
- ✅ Works offline
- ✅ Model already included in your setup

**Cons:**
- ⚠️ Requires `sentence-transformers` library
- ⚠️ Uses local CPU/GPU resources

**Setup:**
```bash
pip install sentence-transformers
```

**Model Location:** `./EmbeddingModels/all-MiniLM-L6-v2` (already present)

**Best for:**
- Development and testing
- Cost-sensitive deployments  
- When you want real embeddings without Azure costs
- Offline or air-gapped environments

### 2. Azure Mode
**Configuration**: `mode = azure`

Uses Azure OpenAI embeddings deployment for cloud-based embeddings.

**Pros:**
- ✅ High-quality semantic embeddings
- ✅ Production-grade results
- ✅ Scalable cloud infrastructure
- ✅ No local compute resources needed

**Cons:**
- ❌ Requires separate embeddings deployment in Azure
- ❌ API costs per embedding call
- ❌ Requires internet connection

**Setup Required:**
1. Deploy an embeddings model in Azure OpenAI (e.g., `text-embedding-ada-002`)
2. Set the deployment name in config:
   ```ini
   [embeddings]
   mode = azure
   embeddings_deployment = your-deployment-name
   ```

**Best for:**
- Production deployments
- When highest accuracy is critical
- When you have Azure embeddings deployment available

## Example Configurations

### Local Embeddings (Default)
```ini
[embeddings]
mode = local
```

### Azure Embeddings
```ini
[embeddings]
mode = azure
embeddings_deployment = text-embedding-ada-002
```

## Switching Modes

Simply update `config.ini` and rerun your evaluation:

```bash
# Edit config.ini
nano config.ini

# Change mode to local or azure
mode = local  # or mode = azure

# Run evaluation
python3 rag_eval_standalone.py sample_rag_input.xlsx
```

## Comparison Table

| Feature | Local Mode | Azure Mode |
|---------|-----------|------------|
| **Cost** | Free | $$ per call |
| **Setup** | pip install | Azure deployment |
| **Quality** | High (384-dim) | Highest (1536-dim) |
| **Speed** | Fast (local) | Network dependent |
| **Offline** | ✅ Yes | ❌ No |
| **Model** | all-MiniLM-L6-v2 | text-embedding-ada-002 |

## Troubleshooting

### "Local embeddings model not found" (Local mode)
- Verify the model exists at: `./EmbeddingModels/all-MiniLM-L6-v2`
- Check that the directory structure is intact

### "sentence-transformers not installed" (Local mode)
- Install with: `pip install sentence-transformers`

### "Embeddings deployment not found" (Azure mode)
- Verify the deployment exists in your Azure OpenAI resource
- Check the deployment name matches exactly (case-sensitive)
- Ensure your API key has access to the deployment

### Performance Issues (Local mode)
- First embedding may be slower (model initialization)
- Consider using a GPU for faster processing
- Batch processing is optimized automatically
