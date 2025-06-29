// src/api/api.ts
import axios from "axios";

// Define base URL from environment variables
const API_URL = "http://localhost:8001"; // Updated to match main.py port

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Interfaces for API responses
interface UploadResponse {
  status: string;
  uploaded_files?: string[];
  failed_files?: { filename: string; error: string }[];
}

interface QueryResponse {
  status: string;
  response: string | any; // Adjust based on actual response structure
}

interface SummaryResponse {
  status: string;
  response: string | any; // Adjust based on actual summary response
}

// Upload files endpoint
export const uploadFiles = async (files: File[]): Promise<UploadResponse> => {
  const formData = new FormData();
  files.forEach((file) => formData.append("files", file));
  const response = await api.post("/upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// Query data endpoint
export const queryData = async (query: string): Promise<QueryResponse> => {
  const response = await api.post("/query", new URLSearchParams({ query }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

// Query task endpoint
export const queryTask = async (query: string): Promise<QueryResponse> => {
  const response = await api.post("/task", new URLSearchParams({ query }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

// Query user endpoint
export const queryUser = async (query: string): Promise<QueryResponse> => {
  const response = await api.post("/users", new URLSearchParams({ query }), {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return response.data;
};

// Get group summary endpoint
export const getGroupSummary = async (
  userId: string,
  groupId: string,
  startDate: string,
  endDate: string,
  summaryRules: string
): Promise<SummaryResponse> => {
  const response = await api.get(
    `/users/${userId}/groups/${groupId}/summary?start_date=${startDate}&end_date=${endDate}&summary_rules=${summaryRules}`
  );
  return response.data;
};

// New endpoint: Query tasks by group ID
export const queryGroupTasks = async (
  groupId: string
): Promise<QueryResponse> => {
  const response = await api.post(
    "/groups/groupid/task",
    new URLSearchParams({ group_id: groupId }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return response.data;
};

// New endpoint: Query tasks by user phone number
export const queryUserTasks = async (
  userPhoneNumber: string,
  query: string = "get tasks assigned for the role which we are providing and get it from all groups if user exits in all groups  "
): Promise<QueryResponse> => {
  const response = await api.post(
    "/groups/userid/task",
    new URLSearchParams({ user_phone_number: userPhoneNumber, query }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return response.data;
};

// New endpoint: Query user tasks (alternative to /users/task)
export const queryUserTask = async (query: string): Promise<QueryResponse> => {
  const response = await api.post(
    "/users/task",
    new URLSearchParams({ query }),
    {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    }
  );
  return response.data;
};

// New endpoint: Get all groups
export const getGroups = async (): Promise<QueryResponse> => {
  const response = await api.get("/groups", {
    headers: { "Content-Type": "application/json" },
  });
  return response.data;
};

// Export for error handling or custom configuration if needed
export default api;
