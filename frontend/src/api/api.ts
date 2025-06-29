// src/api/api.ts
import axios from "axios";
 
// Define base URL from environment variables
const API_URL = "http://localhost:8000"; // Matches main.py port
 
// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
});
 
// Interfaces for API responses
interface UploadResponse {
  status: string;
  uploaded_files?: string[];
  failed_files?: { filename: string; error: string }[];
}
 
interface QueryResponse {
  status: string;
  response: any; // Flexible to handle nested or flat responses (e.g., {status, message} or {status, response: {...}})
}
 
interface SummaryResponse {
  status: string;
  response: string | any; // Adjust based on actual summary response
}
 
// Upload files endpoint
export const uploadFiles = async (files: File[]): Promise<UploadResponse> => {
  try {
    const formData = new FormData();
    files.forEach((file) => formData.append("files", file));
    const response = await api.post("/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Upload failed: ${error.message}`);
  }
};
 
// Query data endpoint
export const queryData = async (query: string): Promise<QueryResponse> => {
  try {
    const response = await api.post("/query", new URLSearchParams({ query }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Query failed: ${error.message}`);
  }
};
 
// Query task endpoint
export const queryTask = async (query: string): Promise<QueryResponse> => {
  try {
    const response = await api.post("/task", new URLSearchParams({ query }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Task query failed: ${error.message}`);
  }
};
 
// Query user endpoint
export const queryUser = async (query: string): Promise<QueryResponse> => {
  try {
    const response = await api.post("/users", new URLSearchParams({ query }), {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });
    return response.data;
  } catch (error) {
    throw new Error(`User query failed: ${error.message}`);
  }
};
 
// Get group summary endpoint
export const getGroupSummary = async (
  userId: string,
  groupId: string,
  startDate: string,
  endDate: string,
  summaryRules: string
): Promise<SummaryResponse> => {
  try {
    const response = await api.get(
      `/users/${userId}/groups/${groupId}/summary?start_date=${startDate}&end_date=${endDate}&summary_rules=${summaryRules}`
    );
    return response.data;
  } catch (error) {
    throw new Error(`Summary query failed: ${error.message}`);
  }
};
 
// Query tasks by group ID
export const queryGroupTasks = async (
  groupId: string
): Promise<QueryResponse> => {
  try {
    const response = await api.post(
      "/groups/groupid/task",
      new URLSearchParams({ group_id: groupId }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`Group task query failed: ${error.message}`);
  }
};
 
// Query tasks by user phone number
export const queryUserTasks = async (
  userPhoneNumber: string,
  query: string = "get tasks assigned for the role which we are providing and get it from all groups if user exists in all groups"
): Promise<QueryResponse> => {
  try {
    const response = await api.post(
      "/groups/userid/task",
      new URLSearchParams({ user_phone_number: userPhoneNumber, query }),
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error(`User task query failed: ${error.message}`);
  }
};
 
// Query all groups
export const getGroups = async (): Promise<QueryResponse> => {
  try {
    const response = await api.get("/groups", {
      headers: { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (error) {
    throw new Error(`Groups query failed: ${error.message}`);
  }
};
 
// Export for error handling or custom configuration if needed
export default api;
 
 