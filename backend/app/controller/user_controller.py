from typing import List
from langsmith import traceable
import logging

from app.model.vectorstore_model import search_vectorstore
from app.service.langstream_service import run_traced_claude_task
from app.model.embedding_model import get_embedding

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@traceable(name="User Agent")
def user_query(query: str, top_k: int = 5) -> str:
    try:
        logger.info("Inside the user agent")
        # Step 1: Generate Titan embedding for the user query
        query_embedding = get_embedding(query)

        # Step 2: Search ChromaDB for similar documents
        search_results = search_vectorstore(query_embedding, top_k=top_k)

        matched_docs: List[str] = search_results.get("documents", [[]])[0]
        metadatas: List[dict] = search_results.get("metadatas", [[]])[0]

        if not matched_docs:
            return "⚠️ No relevant documents found to answer the query."

        # Step 3: Combine context + tags from metadata
        context_blocks = []
        for idx, doc in enumerate(matched_docs):
            tag = f"(Document Type: {metadatas[idx].get('type', 'Unknown')}, Source: {metadatas[idx].get('s3_path', 'N/A')})"
            context_blocks.append(f"{tag}\n{doc.strip()}")

        context = "\n\n---\n\n".join(context_blocks)
        logger.info("Context sent to LLM:%s", context)

        # Step 4: Compose Claude prompt
        prompt = f"""
You are an AI assistant for the AP Police AI Platform, designed to process and query police-related documents stored in a vector store. The documents include:

1. members_info.json: Contains user details with fields: id, name, role, jurisdiction_type, jurisdiction_name, phone_number, reports_to_id.
2. group_info.json: Contains group details with fields: grp_id, gname, purpose.
3. hierarchy.json: Defines the reporting structure with fields: mem_id, Reports_to.
4. ranks.json: Lists ranks and their levels with fields: Rank, level.
5. Part1.txt and Part2.txt: Chat logs containing operational communications. Use these only if the query explicitly requests chat-based information.

Your task is to respond to queries about users and groups based on the provided documents. For each query, follow these instructions:

1. Retrieve users from all groups:
   - Extract all users from members_info.json.
   - For each user, include the following fields:
     - user_id: from members_info.json, use the value in the id field
     - name: from members_info.json, use the value in the name field
     - role: from members_info.json, use the value in the role field
     - reports_to_id: from members_info.json, use the value in the reports_to_id field. Then match this value to hierarchy.json by assigning mem_id values to each reports_to_id based on relative rank level (using ranks.json). Convert the reports_to_id to the corresponding mem_id. This mem_id becomes the final reports_to_id in the output
     - jurisdiction_type: from members_info.json, use the value in the jurisdiction_type field
     - jurisdiction_name: from members_info.json, use the value in the jurisdiction_name field
     - phone_number: from members_info.json, use the value in the phone_number field
     - grp_id: Assume all users in members_info.json belong to the same group that appears in the corresponding group_info.json context. Assign that grp_id to all users.
     - group_name: From group_info.json, retrieve the gname field corresponding to that single grp_id. Apply this value to all users.
     - rank_level:
       - Take the role from members_info.json.
       - Map it to one of the following shorthand ranks:
         - Superintendent of Police maps to SP
         - Additional Superintendent of Police maps to Addl.SP
         - Deputy Superintendent of Police maps to DSP
         - Inspector maps to INSP
         - Sub Inspector maps to SI
       - Use this shorthand to look up the level in ranks.json.
       - If no match is found, return "Not available in context".
     - reports_to_name:
       - Use the reports_to_id value from members_info.json.
       - Match this ID to the id field in members_info.json.
       - If a match is found, extract the corresponding name.
       - If no match is found, return "Not available in context".

   Chain-of-Verification rules:
   - For each field, return only values explicitly found in the context.
   - If a user’s id is not present in hierarchy.json, set reports_to_id to "Not available in context".
   - If reports_to_id cannot be matched to a user in members_info.json, set reports_to_name to "Not available in context".
   - If the user’s role does not match any entry in ranks.json, set rank_level to "Not available in context".
   - If the user’s grp_id does not match any entry in group_info.json, set group_name to "Not available in context".

2. Return users from specific groups with group name and metadata:
   - For each group in group_info.json, list all users whose grp_id matches the group.
   - Include all user fields described above, and perform the same verification steps.
   - If the user’s grp_id does not appear in the context or cannot be verified, do not include them in the group.
   - Do not infer group membership without explicit grp_id evidence.

3. Return users from a specific group based on the query:
   - If the query specifies a group ID (e.g., "GRP_BANDOBST_NORTH"), return only users from that group along with the group’s name.
   - If the query does not specify a group ID, return users from all groups and include the following note: "No specific group ID provided; returning users from all groups".
   - If the group ID exists in group_info.json but has no matching users in members_info.json, return an empty user list with a note: "No users found for [group_id] in members_info.json".
   - If the group ID does not exist in group_info.json, return an empty user list with a note: "Group [group_id] not found in group_info.json".

Response Format:
- Return a JSON object with three sections:
  - all_users: List all users across all groups with their complete details as described above.
  - groups_with_users: Group users by group ID, including group_name, and user details.
  - specific_group_users: Users from the queried group ID (if provided), with group metadata and a note if no users or group is found.
- If a required field cannot be verified in the context, return "Not available in context" instead of null.
- If no users or groups match the query, return empty lists for the corresponding section(s) with appropriate notes.
- Return the final result as a valid JSON string enclosed in triple backticks like this: ```json

Query Handling:
- Parse the query to identify if a specific group ID is mentioned (e.g., "GRP_BANDOBST_NORTH").
- If ambiguous or unspecified, include all users in specific_group_users with the note: "No specific group ID provided; returning users from all groups".
- Cross-reference members_info.json, group_info.json, hierarchy.json, and ranks.json using only the content retrieved from the vector store.
- Use Part1.txt and Part2.txt only if the query references chat messages, coordination updates, or specific events like marathons or fairs.

Example Query:
- "Get users from GRP001"
  - Return users from GRP001 in specific_group_users, plus all users and grouped users in the other sections.
- "Get users from GRP_BANDOBST_NORTH"
  - If no users match, return an empty list in specific_group_users with group metadata and note: "No users found for GRP_BANDOBST_NORTH in members_info.json".

Current Context:
- Documents are stored in a vector store and accessed via a FastAPI /users endpoint.
- Context includes vector search results from members_info.json, group_info.json, hierarchy.json, ranks.json, and chat logs (Part1.txt, Part2.txt), though focus should remain on user/group data unless otherwise requested.
- Current date and time: 11:45 AM IST, Saturday, June 28, 2025.

Document Context:
{context}

Query:
{query}

Final Answer:
Return the response as a JSON string in the format specified above.
"""

        
        # Step 5: Get answer from Claude with LangSmith trace
        print("\n\n response from llm:", run_traced_claude_task(prompt, agent_name="User Agent"))
        return run_traced_claude_task(prompt, agent_name="User Agent")

    except Exception as e:
        return f"❌ Error during query processing: {type(e).__name__} - {e}"
