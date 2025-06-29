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
def all_summary_query(
    group_id: str,
    start_date: str,
    end_date: str,
    summary_rules: str ,
    top_k: int = 5
) -> str:
    try:
        logger.info("Inside summary controller for user_id: %s, group_id: %s, date range: %s to %s", 
                  group_id, start_date, end_date)
        
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
You are an AI summarization assistant for a multi-group police command system.
 
---
 
Input Parameters:
 
- Officer requesting summary:
  Name: {{officer_name}}
  User ID: {{user_id}}
  Rank: {{officer_rank}}
 
- Date range: {{start_date}} to {{end_date}}
 
- Group IDs involved: {{group_ids}}  
  (Each group has its own members, hierarchy, and chat logs)
 
- Summary Rule:
  "{{summary_rules}}"  
  This includes both the **content themes** (e.g., escalations, VIP planning) and the **expected output format** (e.g., bullet points, grouped by date).  
  Refer to this rule strictly when generating your output.
 
---
 
Data Provided for Each Group:
 
For each group in {{group_ids}}, you are given:
 
1. **group_info** — Purpose, scope, and operational focus of the group.
 
2. **members_info** — List of officers in that group, with:
   - `id` (officer ID)
   - `name`
   - `role`
   - `jurisdiction`
   - `reports_to_id` (to build the internal hierarchy)
 
3. **chat logs** — Filtered from ChromaDB by `group_id` and the requested `date_range`.
 
4. **(Optional)** `ranks.json` — Provides rank-to-level mappings to support command visibility.
 
---
 
Your Responsibilities:
 
1. For each group, dynamically construct the officer hierarchy using `members_info`:
   - Officers with `reports_to_id = null` are top-level.
   - Subordinates are any officers whose `reports_to_id` chain leads to the requesting officer.
   - Officers may have different roles in different groups — always use the group-specific `members_info`.
 
2. Determine if the requesting officer:
   - Belongs to the group directly, OR
   - Has subordinates within that group
 
   Only include chat content from that group if one of these conditions is true.
 
3. Identify who sent each message:
   - Use `user_id` (e.g., phone number or chat alias) to match against `members_info.id`
   - If sender is not found in `members_info`, treat as external and ignore
 
4. From all valid groups, extract messages from:
   - The requesting officer
   - Their direct or indirect subordinates (within each group)
 
5. Apply the `summary_rules` to filter and summarize:
   - Only the themes requested (e.g., escalations, VIP planning)
   - Only messages within the requested date range
 
---
 
Output Instructions:
 
Format your output as follows:
- Use one section per calendar date in the range
- Label each section clearly with YYYY-MM-DD
- Within each date, list bullet points only
- Begin each bullet with the source group: [Group ID] or [Group Name]
- Bullet points must match the style and tone defined in the `summary_rules`
- Do not use paragraphs or prose
- If no relevant updates for a day, state: "No relevant updates found."
 
Do not hallucinate:
- Only summarize what is explicitly available in the chat logs
- Do not infer or assume content outside provided documents
- Do not mix officers or roles across groups — always use group-specific context
 
Sort the output chronologically from start_date to end_date.
 
---
 
Provided Context:
 
- group_info for each group in group_ids
- members_info for each group in group_ids
- chat logs from ChromaDB (filtered by group and date)
- (optional) rank mappings via ranks.json
 
---
 
End of instructions.

  
  ---

📄 Document Context:
{context}

❓ Question:
{summary_rules}

---
"""

   
        # Step 5: Get answer from Claude with LangSmith trace
        return run_traced_claude_task(prompt, agent_name="ALl Summary Agent")

    except Exception as e:
        return f"❌ Error during query processing: {type(e).__name__} - {e}"