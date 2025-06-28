import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api";

export interface BackendTask {
  _id: string;
  taskText: string;
  status: string;
  deadline: string;
  assignedBy: { _id: string; name: string };
  assignedTo: { _id: string; name: string };
  groupId: { _id: string; name: string };
}

export interface BackendGroup {
  _id: string;
  name: string;
  members: { _id: string; name: string }[];
}

export interface BackendMessage {
  _id: string;
  groupId: string;
  senderAlias: string;
  senderId?: { _id: string; name: string };
  message: string;
  timestamp: string;
  isMedia: boolean;
}

export const fetchTasksByUser = async (
  userId: string
): Promise<BackendTask[]> => {
  const response = await axios.get(`${API_BASE_URL}/tasks/user/${userId}`);
  return response.data;
};

export const fetchGroups = async (): Promise<BackendGroup[]> => {
  const response = await axios.get(`${API_BASE_URL}/chats/groups`);
  return response.data;
};

export const fetchMessagesByGroup = async (
  groupId: string
): Promise<BackendMessage[]> => {
  const response = await axios.get(`${API_BASE_URL}/chats/group/${groupId}`);
  return response.data;
};

export const uploadFiles = async (formData: FormData): Promise<void> => {
  await axios.post(`${API_BASE_URL}/chats/parse`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
