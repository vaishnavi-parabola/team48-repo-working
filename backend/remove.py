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
 
# Function to clear and reinitialize the collection
def clear_chroma_collection():
    try:
        print("🧹 Clearing existing ChromaDB collection...")
        client.delete_collection(name="documents")
        global collection
        collection = client.get_or_create_collection(name="documents")
        print("✅ ChromaDB collection cleared and re-initialized.")
    except Exception as e:
        print("❌ Failed to clear ChromaDB collection:", e)
 