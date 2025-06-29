import logging
from typing import List, Optional
from langsmith import traceable
from app.model.vectorstore_model import search_vectorstore
from app.service.langstream_service import run_traced_claude_task
from app.model.embedding_model import get_embedding

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@traceable(name="Summary Agent")
def summary_query(
    user_id: str,
    group_id: str,
    start_date: str,
    end_date: str,
    summary_rules: str ,
    top_k: int = 5
) -> str:
    try:
        logger.info("Inside summary controller for user_id: %s, group_id: %s, date range: %s to %s", 
                    user_id, group_id, start_date, end_date)
        
        # Step 1: Generate Titan embedding for the query
        query_embedding = get_embedding(summary_rules)
        # logger.info("Generated Titan embedding for query: %s", summary_rules)
        
        logger.info("Generated Titan embedding for query: %s", summary_rules)

        # Step 2: Search ChromaDB for relevant chat logs
        search_results = search_vectorstore(query_embedding, top_k=top_k)
        matched_docs: List[str] = search_results.get("documents", [[]])[0]
        metadatas: List[dict] = search_results.get("metadatas", [[]])[0]

        # # Step 2: Search ChromaDB for relevant chat logs
        # search_results = search_vectorstore(query_embedding, top_k=top_k)
        # matched_docs: List[str] = search_results.get("documents", [[]])[0]
        # metadatas: List[dict] = search_results.get("metadatas", [[]])[0]

        # if not matched_docs:
        #     logger.warning("No relevant documents found for group_id: %s", group_id)
            

        # # Step 3: Filter documents by group_id and date range
        context_blocks = []
        for idx, doc in enumerate(matched_docs):
            tag = f"(Document Type: {metadatas[idx].get('type', 'Unknown')}, Source: {metadatas[idx].get('s3_path', 'N/A')})"
            context_blocks.append(f"{tag}\n{doc.strip()}")

        context = "\n\n---\n\n".join(context_blocks)
        logger.info("Context sent to LLM:%s", context)

        if not context_blocks:
            logger.warning("No chat logs found for group_id: %s in date range: %s to %s", 
                          group_id, start_date, end_date)
        
        # Step 3: Filter documents by group_id, date range, and document type
        # context_blocks = []
        # for idx, doc in enumerate(matched_docs):
        #     metadata = metadatas[idx]
        #     doc_group_id = metadata.get('grp_id', 'N/A')
        #     doc_date = metadata.get('date', None)
        #     doc_type = metadata.get('type', 'Unknown')
        #     source = metadata.get('s3_path', metadata.get('path', 'N/A'))

        #     # Only include chat logs for the specified group_id and type 'chat_log'
        #     if doc_type != 'chat_log' or doc_group_id != group_id:
        #         logger.debug("Skipping document: type=%s, group_id=%s (expected: %s)", 
        #                     doc_type, doc_group_id, group_id)
        #         continue

        #     # Filter by date range if date is present
        #     if doc_date and (doc_date < start_date or doc_date > end_date):
        #         logger.debug("Skipping document: date=%s (outside range %s to %s)", 
        #                     doc_date, start_date, end_date)
        #         continue

        #     # Include documents mentioning the user_id
        #     if user_id not in doc:
        #         logger.debug("Skipping document: user_id=%s not found in content", user_id)
        #         continue

        #     tag = f"(Document Type: {doc_type}, Source: {source}, Group ID: {doc_group_id}, Date: {doc_date or 'N/A'})"
        #     context_blocks.append(f"{tag}\n{doc.strip()}")

        # context = "\n\n---\n\n".join(context_blocks) if context_blocks else "No relevant chat logs found."
        # logger.info("Context sent to LLM:\n%s", context)
           

        # Step 4: Compose Claude prompt
        prompt = f"""
You are an AI summarization assistant for a multi-group police command system in Andhra Pradesh.
 
---
 
Input Parameters:
 
- Officer requesting summary:
  Name: {{officer_name}}
  User ID: {{user_id}}
  Rank: {{officer_rank}}
 
- Date Range: {{start_date}} to {{end_date}}
 
- Group(s) Involved: {{group_ids}}  
  Each group has its own internal files for officers, hierarchy, chat logs, and rules.
 
- Summary Rule:
  "{{summary_rules}}"  
  This includes both the **content themes** (e.g., escalations, VIP planning) and the **expected output format** (e.g., bullet points grouped by date). Follow it precisely.
 
---
 
Group-wise File Mapping:
 
| Group ID           | Group Files Used                                                                 |
|--------------------|----------------------------------------------------------------------------------|
| GRP_COORD_VZM      | members_info.json, ranks.json, group_info.json, Part1.txt, Part2.txt            |
| GRP_BANDOBST_NORTH | members_info 1.json, ranks 1.json, group_info 1.json, Part1 1.txt, Part2 1.txt  |
| GRP_DCB_VZM        | members_info 2.json, ranks 2.json, group_info 2.json, Part1 2.txt               |
 
Always use **only the files associated with the group_id(s) mentioned in the input**. Do not use data from other groups.
 
---
 
What to Do:
 
1. **Use only chat messages** between `{{start_date}}` and `{{end_date}}`, strictly inclusive.
 
2. For each `group_id`, you are given:
   - `group_info*.json`: Contains group name and purpose. Include these in your output.
   - `members_info*.json`: Officer metadata with name, role, jurisdiction, reports_to_id.
   - `ranks*.json`: Rank-level mapping (e.g., SP = Level 1).
   - `Part*.txt`: Raw chat logs extracted from ChromaDB, filtered by date and group.
 
3. **Hierarchy Inference (per group)**:
   - Officers with `reports_to_id = null` are top-level.
   - An officer's subordinates are defined recursively through `reports_to_id`.
   - Use only the `members_info` for the current group to infer relationships.
   - Only include chats where the sender is the requesting officer or one of their subordinates in that group.
 
4. **Message Attribution**:
   - Match chat message senders using `user_id` from members_info.
   - If sender ID is missing or unmatched, ignore that message as external.
 
5. **Summary Generation**:
   - For each date in the range, summarize the valid messages using `summary_rules`.
   - Include only information related to the requested themes (e.g., VIP planning, escalations).
   - Do not hallucinate; summarize only what is explicitly in the logs.
   - If no valid updates exist for a date, output: `"No relevant updates found."`
 
---
 
Output Format:
 
```json
{
  "summary": [
    {
      "date": "YYYY-MM-DD",
      "points": [
        "[Group Name] Bullet point about relevant event or update",
        "[Group ID] Another relevant bullet point"
      ]
    },
    ...
  ],
  "group_details": [
    {
      "group_id": "...",
      "group_name": "...",
      "group_purpose": "..."
    },
    ...
  ],
  "user_details": {
    "user_id": "...",
    "name": "...",
    "role": "...",
    "jurisdiction_type": "...",
    "jurisdiction_name": "...",
    "reports_to_id": "...",
    "phone_number": "...",
    "rank_level": ...
  },
  "note": "Explain if no data found or no valid chat logs matched the criteria."
  
  ---

📄 Document Context:
{context}

❓ Question:
{summary_rules}

---
}```"""

   
        # Step 5: Get answer from Claude with LangSmith trace
        return run_traced_claude_task(prompt, agent_name="Summary Agent")

    except Exception as e:
        return f"❌ Error during query processing: {type(e).__name__} - {e}"