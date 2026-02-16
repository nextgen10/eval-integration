import re
import os
import pdfplumber
from typing import List, Dict, Any, Optional
from .base_agent import BaseAgent
from agent_models import AgentStatus


class PDFAgent(BaseAgent):
    def __init__(self, embedding_model: str = "all-MiniLM-L12-v2", collection_name: str = "pdfs", persist_dir: str = "./chroma_db", event_callback=None):
        super().__init__(name="PDF Agent")
        self.embedding_model_name = embedding_model
        self.persist_dir = persist_dir
        self.collection_name = collection_name
        self.collection = None
        self.event_callback = event_callback
        self.client = None
        
        # We will init chroma lazily or on first use if possible, 
        # but since __init__ is called by Orchestrator, we should probably do it there 
        # BUT Orchestrator is now lazy-loading agents, so it's fine to do it here.
        # However, to be extra safe against top-level import costs in main.py (if any),
        # we keep imports inside methods.
        
        self._chroma_initialized = False

    def _init_chroma(self):
        if self._chroma_initialized:
            return

        print("Initializing ChromaDB...")
        try:
            import chromadb
            from chromadb.utils import embedding_functions
            
            # Check for persistent client
            try:
                from chromadb import PersistentClient
                CHROMA_MODE = "persistent"
            except ImportError:
                try:
                    from chromadb import Client
                    CHROMA_MODE = "client"
                except ImportError:
                    CHROMA_MODE = None
            
            if not CHROMA_MODE:
                print("ChromaDB not available.")
                return

            if CHROMA_MODE == "persistent":
                self.client = chromadb.PersistentClient(path=self.persist_dir)
            else:
                self.client = chromadb.Client()

            # embedding function wrapper
            # This imports sentence_transformers
            ef = embedding_functions.SentenceTransformerEmbeddingFunction(model_name=self.embedding_model_name)

            existing = [c.name for c in self.client.list_collections()]
            if self.collection_name in existing:
                self.collection = self.client.get_collection(self.collection_name, embedding_function=ef)
            else:
                self.collection = self.client.create_collection(name=self.collection_name, embedding_function=ef)
            
            self._chroma_initialized = True
            print("ChromaDB initialized.")

        except Exception as e:
            print(f"Failed to initialize ChromaDB: {e}")
            self.collection = None

    def extract_text_from_pdf(self, path: str) -> str:
        out = []
        try:
            with pdfplumber.open(path) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        out.append(text)
        except Exception as e:
            print(f"Error reading PDF {path}: {e}")
            return ""
        return "\n".join(out)

    async def reset(self):
        self._init_chroma()
        print("\n--- Resetting Vector DB ---")
        if self.event_callback:
            await self.event_callback(AgentStatus(agent_name="PDF Agent", status="working", message="Deleting existing vector collection..."))
        if self.collection:
            try:
                self.client.delete_collection(self.collection_name)
                print(f"Deleted collection: {self.collection_name}")
                if self.event_callback:
                    await self.event_callback(AgentStatus(agent_name="PDF Agent", status="working", message=f"Deleted collection: {self.collection_name}"))
            except Exception as e:
                print(f"Error deleting collection: {e}")
                if self.event_callback:
                    await self.event_callback(AgentStatus(agent_name="PDF Agent", status="failed", message=f"Error deleting collection: {e}"))
            
            # Re-create
            self._chroma_initialized = False
            self.collection = None
            self._init_chroma()
            print("Re-initialized ChromaDB collection")
            if self.event_callback:
                await self.event_callback(AgentStatus(agent_name="PDF Agent", status="completed", message="Vector DB reset complete"))

    async def add_pdfs(self, pdf_paths: List[str], chunk_sentence_max: int = 2):
        self._init_chroma()
        if not self.collection:
            return
            
        print(f"PDFAgent: Adding PDFs: {pdf_paths}")
        for path in pdf_paths:
            if self.event_callback:
                await self.event_callback(AgentStatus(agent_name="PDF Agent", status="working", message=f"Extracting text from {os.path.basename(path)}..."))
            text = self.extract_text_from_pdf(path)
            if not text:
                print(f"PDFAgent: No text extracted from {path}")
                if self.event_callback:
                    await self.event_callback(AgentStatus(agent_name="PDF Agent", status="failed", message=f"No text extracted from {os.path.basename(path)}"))
                continue
                
            sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
            docs, ids = [], []
            idx = 0
            for i in range(0, len(sentences), chunk_sentence_max):
                chunk = " ".join(sentences[i:i + chunk_sentence_max])
                docs.append(chunk)
                ids.append(f"{os.path.basename(path)}_{idx}")
                idx += 1
            if docs:
                self.collection.add(documents=docs, ids=ids)
                print(f"PDFAgent: Added {len(docs)} chunks from {path}")
                if self.event_callback:
                    await self.event_callback(AgentStatus(agent_name="PDF Agent", status="completed", message=f"Added {len(docs)} chunks from {os.path.basename(path)} to vector DB"))
        
        print(f"Added PDFs to vector store: {pdf_paths}")

    def query(self, text: str, top_k: int = 1) -> float:
        self._init_chroma()
        if not self.collection or not text.strip():
            return 0.0
            
        res = self.collection.query(query_texts=[text], n_results=top_k)
        # handle multiple versions of Chroma results
        dists = []
        if isinstance(res, dict):
            dists = res.get("distances") or []
        else:
            dists = getattr(res, "distances", [])
            
        print(f"PDFAgent Query: '{text[:30]}...' -> Dists: {dists}")

        if dists and len(dists) > 0 and len(dists[0]) > 0:
            # Chroma returns distances (lower is better). 
            # Convert to similarity (1 - distance) assuming cosine distance.
            # Note: Chroma default is L2 or Cosine depending on config. 
            # Usually cosine distance is returned if configured, range 0-2.
            # If using default l2, range is 0-inf.
            # Assuming the user's script logic: sim = 1.0 - dists[0][0]
            sim = 1.0 - dists[0][0]
            print(f"PDFAgent Similarity: {sim}")
            return sim
        return 0.0

    def get_context(self, text: str, top_k: int = 3) -> str:
        self._init_chroma()
        if not self.collection or not text.strip():
            return ""

        print(f"PDFAgent Context Retrieval: Querying for '{text[:30]}...' (top_k={top_k})")
        res = self.collection.query(query_texts=[text], n_results=top_k)
        
        # Extract documents (chunks)
        documents = []
        if isinstance(res, dict):
            documents = res.get("documents") or []
        else:
            documents = getattr(res, "documents", [])
            
        if documents and len(documents) > 0:
            # Flatten list of lists (chroma returns [[doc1, doc2]])
            flat_docs = documents[0]
            print(f"PDFAgent Context Retrieval: Found {len(flat_docs)} chunks")
            return "\n\n".join(flat_docs)
            
        return ""

    async def run(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Action: 'add_pdfs', 'query', 'get_context', or 'reset'
        """
        action = input_data.get("action")
        if action == "reset":
            await self.reset()
            return {"status": "success", "message": "Vector DB reset"}
            
        elif action == "add_pdfs":
            paths = input_data.get("paths", [])
            await self.add_pdfs(paths)
            return {"status": "success", "message": f"Added {len(paths)} PDFs"}
            
        elif action == "query":
            text = input_data.get("text", "")
            threshold = input_data.get("threshold", 0.75)
            if self.event_callback:
                await self.event_callback(AgentStatus(agent_name="PDF Agent", status="working", message=f"Querying vector DB for: {text[:50]}..."))
            sim = self.query(text)
            in_pdf = sim >= threshold
            print(f"PDFAgent Check: Sim={sim:.4f} >= Threshold={threshold} -> {in_pdf}")
            if self.event_callback:
                await self.event_callback(AgentStatus(agent_name="PDF Agent", status="completed", message=f"Similarity: {sim:.4f}, In PDF: {in_pdf}"))
            return {"similarity": sim, "in_pdf": in_pdf}

        elif action == "get_context":
            text = input_data.get("text", "")
            top_k = input_data.get("top_k", 5)
            context = self.get_context(text, top_k)
            return {"context": context}
            
        return {"status": "error", "message": "Unknown action"}
