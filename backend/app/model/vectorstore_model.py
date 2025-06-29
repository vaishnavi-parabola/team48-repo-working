import os
from typing import List, Dict
from chromadb import PersistentClient

# Set absolute path for Chroma DB directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DB_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../chroma_db"))

print(f"📂 Chroma DB will be stored at: {CHROMA_DB_DIR}")
os.makedirs(CHROMA_DB_DIR, exist_ok=True)

# Initialize ChromaDB persistent client
client = PersistentClient(path=CHROMA_DB_DIR)

# Initialize collection
collection = client.get_or_create_collection(name="documents")

# Function to sanitize metadata
def sanitize_metadata(raw_metadata: Dict) -> Dict:
    keys_to_keep = {"original_file", "chunk_index", "total_chunks", "type"}
    return {k: v for k, v in raw_metadata.items() if k in keys_to_keep}

# Function to log the stored documents and metadata
def log_stored_documents():
    try:
        docs = collection.get()
        print("✅ Stored Document IDs:", docs.get("ids", []))
        print("🧠 Metadata:", docs.get("metadatas", []))
    except Exception as e:
        print("⚠️ Failed to retrieve stored documents:", e)

# Function to add a document to the vectorstore
def add_to_vectorstore(
    doc_id: str,
    embedding: List[float],
    metadata: Dict,
    document_text: str = ""
):
    try:
        clean_metadata = sanitize_metadata(metadata)
        collection.add(
            ids=[doc_id],
            embeddings=[embedding],
            metadatas=[clean_metadata],
            documents=[document_text]
        )
        print(f"✅ Added to ChromaDB: {doc_id}")
    except Exception as e:
        print(f"❌ Failed to add {doc_id} to ChromaDB:", e)

# Function to perform a similarity search
def search_vectorstore(query_embedding: List[float], top_k: int = 5):
    try:
        results = collection.query(query_embeddings=[query_embedding], n_results=top_k)
        print("🔍 Query Results:", results)
        return results
    except Exception as e:
        print("❌ Vector search failed:", e)
        return {}

# ------------------ Example Usage ------------------
if __name__ == "__main__":
    # STEP 1: Add a sample document
    dummy_embedding = [0.01] * 768  # Replace with real embedding
    sample_doc_text = "This is a sample document about public safety and law enforcement."
    metadata = {
        "original_file": "Part1.txt",
        "chunk_index": 0,
        "total_chunks": 1,
        "type": "txt",
    }
    doc_id = f"{metadata['original_file'].replace('.txt', '')}_chunk_{metadata['chunk_index']}"
    
    add_to_vectorstore(doc_id, dummy_embedding, metadata, sample_doc_text)

    # STEP 2: Log stored documents
    log_stored_documents()