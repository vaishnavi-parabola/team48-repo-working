from typing import List
from langsmith import traceable
import json
import logging

from app.model.vectorstore_model import search_vectorstore
from app.service.langstream_service import run_traced_claude_task
from app.model.embedding_model import get_embedding

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

@traceable(name="Group Agent")
def group_query() -> str:
    """
    Extract all tasks from the given group using vector search and Claude.
    """
    try:
        # Step 1: Generate Titan embedding
        query_embedding = get_embedding("Give all users")

        # Step 2: Vector search in ChromaDB
        search_results = search_vectorstore(query_embedding, top_k=20)
        matched_docs: List[str] = search_results.get("documents", [[]])[0]
        metadatas: List[dict] = search_results.get("metadatas", [[]])[0]

        if not matched_docs:
            logger.warning("No matched documents found.")
            return json.dumps({"status": "error", "message": "⚠️ No relevant documents found."})

        # Step 3: Combine context
        context_blocks = []
        for idx, doc in enumerate(matched_docs):
            tag = f"(Document Type: {metadatas[idx].get('type', 'Unknown')})"
            context_blocks.append(f"{tag}\n{doc.strip()}")
        context = "\n\n---\n\n".join(context_blocks)

        logger.debug(f"Combined context length: {len(context)} characters")

        # Step 4: Prompt to Claude with actual group_id injected
        prompt = f"""
You are an AI assistant for a multi-group police communication system.
 
Your task is to extract high-level metadata about the active groups in the system.
 
---
 
Input context: multiple group_info documents, each with `grp_id`, `gname`, `purpose`.
 
Extract total unique groups and for each group:
 
- group_id: from grp_id
- group_purpose: from purpose
 
Do NOT hallucinate or interpret — extract as-is.
 
---
 
Output Format (JSON):
```json
{{
  "total_groups": <number>,
  "groups": [
    {{
      "group_id": "<Group ID>",
      "group_purpose": "<Exact Purpose>"
    }},
    ...
  ]
}}```
---

📄 Document Context:
{context}

---
💬 Final Answer:
"""

        # Step 5: Claude generation
        claude_response = run_traced_claude_task(prompt, agent_name="Group Agent")
        logger.info("claude_response:",run_traced_claude_task)
        # logger.debug(f"Claude raw response:")
        return claude_response

    except Exception as e:
        logger.exception("Exception during group task query.")
        return json.dumps({"status": "error", "message": f"❌ Error: {type(e).__name__} - {str(e)}"})