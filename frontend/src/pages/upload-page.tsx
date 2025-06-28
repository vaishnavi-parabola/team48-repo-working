import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, MessageSquare, AlertCircle } from "lucide-react";
import { uploadFiles, fetchMessagesByGroup, BackendMessage } from "../api/api";

interface Message {
  id: string;
  groupId: string;
  sender: string;
  message: string;
  timestamp: string;
  isMedia: boolean;
}

export default function UploadPage() {
  const [chatFile, setChatFile] = useState<File | null>(null);
  const [membersFile, setMembersFile] = useState<File | null>(null);
  const [hierarchyFile, setHierarchyFile] = useState<File | null>(null);
  const [groupName, setGroupName] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [groupId, setGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL = "http://localhost:5000/api";

  const mapBackendMessageToFrontend = (msg: BackendMessage): Message => ({
    id: msg._id,
    groupId: msg.groupId,
    sender: msg.senderId?.name || msg.senderAlias,
    message: msg.message,
    timestamp: new Date(msg.timestamp).toLocaleString(),
    isMedia: msg.isMedia,
  });

  const handleUpload = async () => {
    if (!chatFile || !membersFile || !hierarchyFile || !groupName) {
      setError("Please provide all files and a group name");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("chatFile", chatFile);
      formData.append("membersFile", membersFile);
      formData.append("hierarchyFile", hierarchyFile);
      formData.append("groupName", groupName);

      await uploadFiles(formData);

      // Fetch the group ID from the backend
      const response = await fetch(
        `${API_BASE_URL}/chats/groups?name=${encodeURIComponent(groupName)}`
      );
      const groups = await response.json();
      if (groups.length === 0) throw new Error("Group not found");
      const newGroupId = groups[0]._id;
      setGroupId(newGroupId);

      // Fetch messages
      const groupMessages = await fetchMessagesByGroup(newGroupId);
      setMessages(groupMessages.map(mapBackendMessageToFrontend));
    } catch (err) {
      setError("Failed to upload or fetch data: " + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Bulk Upload Group Data
        </h1>
        <p className="text-gray-600">
          Upload chat logs, group members, and hierarchy to store in the
          database
        </p>

        <Card>
          <CardHeader>
            <CardTitle>Upload Files</CardTitle>
            <CardDescription>
              Select the required files and configure group settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Group Name
              </label>
              <Input
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name (e.g., Kakinada Rural)"
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Chat Log (.txt)
              </label>
              <Input
                type="file"
                accept=".txt"
                onChange={(e) => setChatFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Group Members (.csv)
              </label>
              <Input
                type="file"
                accept=".csv"
                onChange={(e) => setMembersFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hierarchy (.json)
              </label>
              <Input
                type="file"
                accept=".json"
                onChange={(e) => setHierarchyFile(e.target.files?.[0] || null)}
                className="mt-1"
              />
            </div>
            <Button
              onClick={handleUpload}
              disabled={
                !chatFile ||
                !membersFile ||
                !hierarchyFile ||
                !groupName ||
                loading
              }
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {loading ? "Uploading..." : "Upload and Process"}
            </Button>
          </CardContent>
        </Card>

        {error && (
          <Card className="bg-red-50 border-red-200">
            <CardContent className="pt-6 flex items-center text-red-800">
              <AlertCircle className="w-5 h-5 mr-2" />
              {error}
            </CardContent>
          </Card>
        )}

        {groupId && (
          <Card>
            <CardHeader>
              <CardTitle>Parsed Messages</CardTitle>
              <CardDescription>Messages for {groupName}</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                {messages.length > 0 ? (
                  messages.map((msg) => (
                    <div key={msg.id} className="mb-4 p-2 border-b">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 mt-1" />
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {msg.sender}
                          </p>
                          <p className="text-sm text-gray-600">{msg.message}</p>
                          <p className="text-xs text-gray-500">
                            {msg.timestamp} {msg.isMedia && "• Media"}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-500">
                    No messages available
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
