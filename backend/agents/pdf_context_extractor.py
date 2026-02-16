"""
PDF Context Extractor for DeepEval Metrics

Extracts relevant text chunks from PDF files using semantic similarity search.
Used when ground truth doesn't have manual context but pdfs_path is provided.
"""

import os
from typing import List, Optional
import pdfplumber
from sentence_transformers import SentenceTransformer
import numpy as np


def extract_text_from_pdf(pdf_path: str) -> str:
    """Extract all text from PDF file using pdfplumber."""
    try:
        with pdfplumber.open(pdf_path) as pdf:
            text = ""
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
            return text
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {e}")
        return ""


def chunk_text(text: str, chunk_size: int = 200, overlap: int = 50) -> List[str]:
    """
    Split text into overlapping chunks based on word count.
    
    Args:
        text: Input text to chunk
        chunk_size: Number of words per chunk
        overlap: Number of overlapping words between chunks
        
    Returns:
        List of text chunks
    """
    words = text.split()
    chunks = []
    
    for i in range(0, len(words), chunk_size - overlap):
        chunk = ' '.join(words[i:i + chunk_size])
        if chunk.strip():
            chunks.append(chunk)
            
    return chunks


def extract_pdf_context(
    pdf_path: str,
    query: str,
    top_k: int = 3,
    model_name: str = "all-MiniLM-L12-v2",
    chunk_size: int = 200
) -> str:
    """
    Extract top-k most relevant chunks from PDF based on semantic similarity to query.
    
    Args:
        pdf_path: Path to PDF file
        query: Search query (e.g., input_prompt or ai_output)
        top_k: Number of top chunks to return
        model_name: Sentence transformer model name
        chunk_size: Words per chunk
        
    Returns:
        Concatenated text chunks as context string
    """
    if not query or not query.strip():
        print("Warning: Empty query provided to extract_pdf_context")
        return ""
    
    if not os.path.exists(pdf_path):
        print(f"Warning: PDF file not found: {pdf_path}")
        return ""
    
    # Extract text from PDF
    pdf_text = extract_text_from_pdf(pdf_path)
    if not pdf_text.strip():
        print(f"Warning: No text extracted from PDF: {pdf_path}")
        return ""
    
    # Chunk the text
    chunks = chunk_text(pdf_text, chunk_size=chunk_size)
    if not chunks:
        print("Warning: No chunks created from PDF text")
        return ""
    
    print(f"PDF Context Extraction: Created {len(chunks)} chunks from PDF")
    
    # Load sentence transformer model
    try:
        model = SentenceTransformer(model_name)
    except Exception as e:
        print(f"Error loading sentence transformer model: {e}")
        return ""
    
    # Encode query and chunks
    query_embedding = model.encode([query])[0]
    chunk_embeddings = model.encode(chunks)
    
    # Calculate cosine similarities
    similarities = np.dot(chunk_embeddings, query_embedding) / (
        np.linalg.norm(chunk_embeddings, axis=1) * np.linalg.norm(query_embedding)
    )
    
    # Get top-k indices
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    
    # Extract top chunks
    top_chunks = [chunks[i] for i in top_indices]
    top_scores = [similarities[i] for i in top_indices]
    
    print(f"PDF Context Extraction: Top {top_k} chunks selected with scores: {[f'{s:.3f}' for s in top_scores]}")
    
    # Concatenate chunks with newlines
    context = "\n\n".join(top_chunks)
    
    return context


def merge_deduplicate_contexts(context1: str, context2: str) -> str:
    """
    Merge two context strings and remove duplicate sentences.
    Used for hybrid approach (query-based + output-based contexts).
    
    Args:
        context1: First context string
        context2: Second context string
        
    Returns:
        Merged and deduplicated context
    """
    # Split into sentences (simple approach)
    sentences1 = set(s.strip() for s in context1.split('.') if s.strip())
    sentences2 = set(s.strip() for s in context2.split('.') if s.strip())
    
    # Combine and deduplicate
    all_sentences = sentences1.union(sentences2)
    
    # Rejoin
    merged = '. '.join(sorted(all_sentences)) + '.'
    
    return merged
