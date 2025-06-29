import os
import shutil
from chromadb import PersistentClient

# === Setup Persistent ChromaDB Path ===
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DB_DIR = os.path.abspath(os.path.join(BASE_DIR, "../../chroma_db"))
os.makedirs(CHROMA_DB_DIR, exist_ok=True)

print(f"📂 Chroma DB will be stored at: {CHROMA_DB_DIR}")

# === Persistent ChromaDB Client & Collection ===
client = PersistentClient(path=CHROMA_DB_DIR)
collection = client.get_or_create_collection(name="documents")


# === Function: Clear all data in memory ===
def clear_chroma_vectorstore():
    try:
        collection.delete(where={})  # Deletes all entries
        print("🧹 ChromaDB vectorstore cleared.")
    except Exception as e:
        print("❌ Failed to clear vectorstore:", e)


# === Function: Wipe the .chroma folder from disk ===
def wipe_chroma_db_folder():
    try:
        if os.path.exists(CHROMA_DB_DIR):
            shutil.rmtree(CHROMA_DB_DIR)
            print("🧨 ChromaDB folder wiped completely.")
        else:
            print("ℹ️ ChromaDB folder does not exist.")
    except Exception as e:
        print("❌ Failed to wipe ChromaDB folder:", e)


# === Exports ===
__all__ = [
    "clear_chroma_vectorstore",
    "wipe_chroma_db_folder",
    "CHROMA_DB_DIR"
]
