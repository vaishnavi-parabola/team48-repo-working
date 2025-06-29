# from typing import List
# from langsmith import traceable
# import json
# import logging

# from app.model.vectorstore_model import search_vectorstore
# from app.service.langstream_service import run_traced_claude_task
# from app.model.embedding_model import get_embedding

# # Set up logging
# logging.basicConfig(level=logging.DEBUG)
# logger = logging.getLogger(__name__)


# def try_fix_json_response(response: str) -> str:
#     """
#     Attempt to extract a valid JSON block from Claude response.
#     Handles both list and object types, trims incomplete endings, and closes open brackets/braces.
#     """
#     try:
#         # Find the start of the outer object
#         start = response.find('{')
#         if start == -1:
#             return "{}"

#         # Find the last closing brace
#         end = response.rfind('}')
#         if end == -1:
#             return "{}"

#         trimmed = response[start:end + 1]

#         # Remove trailing junk and attempt JSON load
#         while trimmed and not trimmed.strip().endswith("}"):
#             trimmed = trimmed[:-1]

#         # Try parsing to ensure it's valid
#         json.loads(trimmed)
#         return trimmed
#     except Exception as e:
#         logger.warning(f"Failed to fix Claude JSON: {e}")
#         return "{}"


# @traceable(name="Task-Agent-User")
# def user_task(query: str, user_phone_number: str, top_k: int = 20) -> str:
#     """
#     Queries the ChromaDB vector store with a user query, processes the results using Claude,
#     and extracts only tasks that are assigned TO this user (not by themselves), across all groups.
#     Returns JSON in the format:
#     {
#         "user": "<user_phone_number>",
#         "tasks": [ ... ]
#     }
#     """
#     try:
#         logger.debug(f"Processing query: {query} for user: {user_phone_number}")

#         # Step 1: Generate Titan embedding for the user query
#         query_embedding = get_embedding(query)

#         # Step 2: Search ChromaDB for similar documents
#         search_results = search_vectorstore(query_embedding, top_k=top_k)
#         print("=================",search_results)
#         matched_docs: List[str] = search_results.get("documents", [[]])[0]
#         metadatas: List[dict] = search_results.get("metadatas", [[]])[0]

#         if not matched_docs:
#             logger.warning("No matched documents found in ChromaDB.")
#             return json.dumps({
#                 "status": "success",
#                 "response": {
#                     "user": user_phone_number,
#                     "tasks": []
#                 }
#             })

#         logger.debug(f"Matched documents: {len(matched_docs)} found")
#         for idx, doc in enumerate(matched_docs):
#             logger.debug(f"Document {idx}: {doc[:100]}... (Type: {metadatas[idx].get('type', 'Unknown')})")
#         # Step 3: Combine context from metadata + document
#         context_blocks = []
#         for idx, doc in enumerate(matched_docs):
#             tag = f"(Document Type: {metadatas[idx].get('type', 'Unknown')}, Source: {metadatas[idx].get('s3_path', 'N/A')})"
#             context_blocks.append(f"{tag}\n{doc.strip()}")
#         context = "\n\n---\n\n".join(context_blocks)

#         # Step 4: Claude Prompt with exclusion of self-assigned tasks
#         prompt = f"""
# Strict JSON Output Required.

# You are an AI assistant analyzing AP Police WhatsApp chat datasets, along with related personnel, group, hierarchy, and rank data. Your task is to extract only the tasks **assigned to** a specific officer, identified by their phone number: `{user_phone_number}`.

# Return all tasks across all WhatsApp police groups this officer is part of.

# ⚠️ Important: **DO NOT** include tasks where the assigning officer (`assigned_by`) is the same person as the assignee (`user`). Officers should never assign tasks to themselves.

# Required Output Format:
# {{
#   "user": "{user_phone_number}",
#   "tasks": [
#     {{
#       "task_name": "...",
#       "assigned_by": "...",
#       "priority": "...",
#       "deadline": "...",
#       "status": "...",
#       "group_id": "...",
#       "date": "...",
#       "timestamp": "...",
#       "jurisdiction_name": "..."
#     }}
#   ]
# }}

# Each task must be:
# - Assigned to `{user_phone_number}`.
# - Assigned by a different senior officer.
# - Clearly derived from a directive, instruction, or report from chat logs.

# Instructions:
# 1. Use personnel metadata to resolve phone numbers to names, roles, and jurisdictions.
# 2. Use hierarchy data to confirm senior-junior relationship between assigner and assignee.
# 3. Skip any task if the same person appears as both assigner and assignee.
# 4. Infer tasks from directive language or acknowledgments (e.g., "Push", "Ensure", "Proceed", etc.)
# 5. Return only a clean JSON object as shown — no comments, headers, or text outside the object.
# 6. Use the personnel data (from members_info.json) to map phone numbers to names, roles, and jurisdictions.
# 7. Cross-reference hierarchy and rank data to confirm the senior-junior relationship for task assignments (e.g., SP > Addl. SP > DSP > CI > SI).
# 8. Analyze the chat context (from Part1.txt and Part2.txt) to identify all tasks related to the  group_id, including those assigned to individuals or group-wide (e.g., "@All CIs", "@CI").
# 9. For group-wide assignments (e.g., "@All CIs", "@CI"), identify all Circle Inspectors (role: "Circle Inspector") from personnel data and create a separate JSON object for each CI, ensuring all relevant CIs are included.
# 10. If a task is implied but not explicitly stated, infer it from the context (e.g., a response confirming action implies a task).
# 11. Ensure the output is a valid JSON array of task objects, with each object containing all required fields.
# 12. For Identification of tasks you need to go through this words which have the meaning of assiging task If no tasks are found, return an empty JSON array [].
# 13. Return ONLY a valid JSON array as the response, with no additional text, comments, or explanations outside the JSON structure.
# 14. Do not include tasks for users not present in the personnel data or from dates outside.

# Document Context:
# {context}

# Final Answer:
# A valid JSON object like:
# {{
#   "user": "{user_phone_number}",
#   "tasks": [ ... ]
# }}
# """

#         # Step 5: Claude generation
#         claude_response = run_traced_claude_task(prompt, agent_name="Task Agent")
#         logger.debug(f"Claude raw response: {claude_response[:1000]}...")

#         # Step 6: Fix and parse JSON
#         fixed_response = try_fix_json_response(claude_response)
#         logger.debug(f"Fixed Claude response (first 500 chars): {fixed_response[:500]}")

#         try:
#             parsed_response = json.loads(fixed_response)

#             # Ensure structure is correct and matches target user
#             if not isinstance(parsed_response, dict) or parsed_response.get("user") != user_phone_number:
#                 logger.error("Claude response structure invalid or user mismatch.")
#                 return json.dumps({
#                     "status": "error",
#                     "message": "⚠️ Invalid structure or user mismatch in response."
#                 })

#             return json.dumps({
#                 "status": "success",
#                 "response": parsed_response
#             })

#         except json.JSONDecodeError as e:
#             logger.error(f"JSON decode error: {str(e)}. Raw response: {fixed_response[:300]}...")
#             return json.dumps({
#                 "status": "error",
#                 "message": f"⚠️ Invalid JSON response from Claude: {str(e)}"
#             })

#     except Exception as e:
#         logger.exception("Exception during task query.")
#         return json.dumps({
#             "status": "error",
#             "message": f"❌ Error during query processing: {type(e).__name__} - {str(e)}"
#         })



from typing import List
from langsmith import traceable
import json
import logging

from app.model.vectorstore_model import search_vectorstore
from app.service.langstream_service import run_traced_claude_task
from app.model.embedding_model import get_embedding

logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)


def try_fix_json_response(response: str) -> str:
    """
    Try to fix incomplete or malformed JSON returned by Claude.
    Focuses on fixing:
    - Trailing commas
    - Missing closing brackets
    - Incomplete arrays or objects
    """
    import re

    try:
        # Only keep content between first "{" and last "}"
        start = response.find("{")
        end = response.rfind("}")
        if start == -1 or end == -1:
            return "{}"
        response = response[start:end + 1]

        # Remove trailing commas before closing brackets
        response = re.sub(r',\s*([}\]])', r'\1', response)

        # Remove backslashes or smart quotes if inserted
        response = response.replace("“", '"').replace("”", '"').replace("’", "'").replace("\\", "")

        # Ensure top-level keys like "assigned_to_user" and "assigned_by_user" are arrays
        if '"assigned_to_user": {' in response:
            response = response.replace('"assigned_to_user": {', '"assigned_to_user": [')
            response = response.replace('}},', '}],')
        if '"assigned_by_user": {' in response:
            response = response.replace('"assigned_by_user": {', '"assigned_by_user": [')
            response = response.replace('}}', '}]')

        # Try parsing to validate
        json.loads(response)
        return response

    except Exception as e:
        logger.warning(f"Failed to fix Claude JSON: {e}")
        return "{}"


@traceable(name="Task-Agent-User")
def user_task(query: str, user_phone_number: str, top_k: int = 20) -> str:
    try:
        logger.debug(f"Processing query: {query} for user: {user_phone_number}")

        query_embedding = get_embedding(query)
        search_results = search_vectorstore(query_embedding, top_k=top_k)
        matched_docs: List[str] = search_results.get("documents", [[]])[0]
        metadatas: List[dict] = search_results.get("metadatas", [[]])[0]

        if not matched_docs:
            return json.dumps({
                "status": "success",
                "response": {
                    "user": user_phone_number,
                    "assigned_to_user": [],
                    "assigned_by_user": []
                }
            })

        context_blocks = []
        for idx, doc in enumerate(matched_docs):
            tag = f"(Type: {metadatas[idx].get('type', 'Unknown')}, Source: {metadatas[idx].get('s3_path', 'N/A')})"
            context_blocks.append(f"{tag}\n{doc.strip()}")
        context = "\n\n---\n\n".join(context_blocks)

        context=search_results
        print(context)
        # Prompt to extract both task types
#         prompt = f"""
# Strict JSON Output Required.

# You are analyzing AP Police WhatsApp group data. For the officer with phone number `{user_phone_number}`:

# Extract:
# 1. Tasks **assigned TO** this user by others (excluding self-assigned).
# 2. Tasks **assigned BY** this user to others (excluding group-wide "@All" style tasks unless specific users are mentioned).

# Return JSON in this format:
# {{
#   "user": "{user_phone_number}",
#   "assigned_to_user": [
#     {{
#       "task_name": "...",
#       "assigned_by": "...",
#       "priority": "...",
#       "deadline": "...",
#       "status": "...",
#       "group_id": "...",
#       "date": "...",
#       "timestamp": "...",
#       "jurisdiction_name": "..."
#     }}
#   ],
#   "assigned_by_user": [
#     {{
#       "task_name": "...",
#       "assigned_to": "...",
#       "priority": "...",
#       "deadline": "...",
#       "status": "...",
#       "group_id": "...",
#       "date": "...",
#       "timestamp": "...",
#       "jurisdiction_name": "..."
#     }}
#   ]
# }}

# Instructions:
# - Use personnel and hierarchy data to confirm identities and seniority.
# - For `assigned_by_user`, extract all tasks explicitly or implicitly issued by `{user_phone_number}`.
# - Skip tasks where assigner and assignee are same.
# - Only return valid, task-relevant data. No text outside JSON.
# -Strictly first you check the user is present in other groups also if user presents please get the tasks from teh group with that group id.

# Document Context:
# {context}

# Final Answer:
# Return a valid JSON object as shown above avoid this error to fix Claude JSON: Expecting ',' delimiter: line 93 column 6 (char 2781).
# """
        prompt = f"""
Strict JSON Output Required.

You are analyzing AP Police WhatsApp group data. For the officer with phone number `{user_phone_number}`:

Extract:
1. Tasks **assigned TO** this user by others (excluding self-assigned).
2. Tasks **assigned BY** this user to others (excluding group-wide "@All" style tasks unless specific users are mentioned).

Return JSON in this format:
{{
  "user": "{user_phone_number}",
  "assigned_to_user": [
    {{
      "task_name": "...",
      "assigned_by": "...",
      "priority": "...",
      "deadline": "...",
      "status": "...",
      "group_id": "...",
      "date": "...",
      "timestamp": "...",
      "jurisdiction_name": "..."
    }}
  ],
  "assigned_by_user": [
    {{
      "task_name": "...",
      "assigned_to": "...",
      "priority": "...",
      "deadline": "...",
      "status": "...",
      "group_id": "...",
      "date": "...",
      "timestamp": "...",
      "jurisdiction_name": "..."
    }}
  ]
}}

Instructions:
- Use personnel and hierarchy data to confirm identities and seniority.
- For `assigned_by_user`, extract all tasks explicitly or implicitly issued by `{user_phone_number}`.
- Skip tasks where assigner and assignee are same.
- Only return valid, task-relevant data. No text outside JSON.
-Strictly first you check the user is present in other groups also if user presents please get the tasks from teh group with that group id.
- You MUST copy the JSON structure exactly from the template provided.
- Ensure every dictionary key-value pair is separated by a comma.
- DO NOT leave trailing commas.
- DO NOT output incomplete JSON.
Document Context:
{context}

Final Answer:
Return a valid JSON object as shown above avoid this error to fix Claude JSON: Expecting ',' delimiter: line 93 column 6 (char 2781).
"""

        claude_response = run_traced_claude_task(prompt, agent_name="Task Agent")
        fixed_response = try_fix_json_response(claude_response)

        try:
            parsed_response = json.loads(fixed_response)

            if not isinstance(parsed_response, dict) or parsed_response.get("user") != user_phone_number:
                return json.dumps({
                    "status": "error",
                    "message": "⚠️ Invalid structure or user mismatch"
                })

            return json.dumps({
                "status": "success",
                "response": parsed_response
            })

        except json.JSONDecodeError as e:
            return json.dumps({
                "status": "error",
                "message": f"Invalid JSON from Claude: {str(e)}"
            })

    except Exception as e:
        logger.exception("Exception during user_task processing")
        return json.dumps({
            "status": "error",
            "message": f"Exception: {type(e).__name__} - {str(e)}"
        })
