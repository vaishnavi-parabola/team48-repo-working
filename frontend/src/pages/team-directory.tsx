import React, { useState, useEffect, useRef } from "react";
import { Users, RefreshCw, AlertCircle, Clock } from "lucide-react";

// API Configuration and Functions
const API_URL = "http://localhost:8001";

interface QueryResponse {
  status: string;
  response: any;
}

// Query user endpoint - hardcoded with "get all users"
export const queryUser = async (): Promise<QueryResponse> => {
  try {
    const response = await fetch(API_URL + "/users", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ query: "get all users" }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`User query failed: ${error.message}`);
  }
};

// Import the actual Sidebar component
import Sidebar from "@/components/ui/sidebar";

export type User = {
  id?: number;
  name: string;
  role: string;
  reportsTo: string;
  jurisdictionType: string;
  jurisdictionName: string;
  phoneNumber: string;
  groupId: string;
  rankLevel: number;
};

const TeamDirectory = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchUsers = async () => {
    if (isFetchingRef.current) {
      console.log("Already fetching, skipping duplicate call");
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log('Starting user fetch with hardcoded query: "get all users"');
      const response = await queryUser();

      console.log("API Response:", response);

      if (response.status === "success" && response.response) {
        let actualResponse =
          response.response.status === "success"
            ? response.response.response
            : response.response;

        console.log("Processed Response:", actualResponse);
        console.log("Response type:", typeof actualResponse);

        // Handle case where response is a string containing JSON wrapped in markdown
        if (typeof actualResponse === "string") {
          console.log("Response is a string, attempting to extract JSON...");

          // Extract the JSON block from markdown
          const jsonMatch = actualResponse.match(/```json\s*([\s\S]*?)\s*```/);
          let jsonContent = jsonMatch ? jsonMatch[1].trim() : actualResponse;

          // Clean up the JSON content (handle incomplete JSON)
          jsonContent = jsonContent.replace(/,\s*$/, ""); // Remove trailing comma if present
          jsonContent = jsonContent.replace(/\s*reports_to$/, ""); // Remove incomplete "reports_to" suffix

          try {
            actualResponse = JSON.parse(jsonContent);
            console.log("Successfully parsed JSON:", actualResponse);
          } catch (parseError) {
            console.error("Failed to parse JSON:", parseError);
            console.log("Raw JSON content:", jsonContent);
            // Fallback to manual parsing of partial JSON
            const usersArray = [];
            const userLines = jsonContent
              .split("\n")
              .filter((line) => line.trim());
            let currentUser = {};
            for (let line of userLines) {
              if (line.includes("{")) currentUser = {};
              if (line.includes("}")) {
                usersArray.push(currentUser);
                currentUser = {};
              }
              const [key, value] = line
                .split(":")
                .map((s) => s.trim().replace(/["',]/g, ""));
              if (key && value) currentUser[key] = value;
            }
            actualResponse = { all_users: usersArray };
            console.log("Fallback parsed users:", actualResponse.all_users);
          }
        }

        console.log("Final actualResponse type:", typeof actualResponse);
        console.log("Final actualResponse:", actualResponse);

        // Handle different possible response structures
        let usersArray = [];

        if (actualResponse && typeof actualResponse === "object") {
          if (Array.isArray(actualResponse.all_users)) {
            usersArray = actualResponse.all_users;
            console.log("Found users in response.all_users");
          } else if (Array.isArray(actualResponse.users)) {
            usersArray = actualResponse.users;
            console.log("Found users in response.users");
          } else if (Array.isArray(actualResponse.data)) {
            usersArray = actualResponse.data;
            console.log("Found users in response.data");
          } else if (Array.isArray(actualResponse)) {
            usersArray = actualResponse;
            console.log("Found users in response array");
          }
        }

        console.log("Final usersArray length:", usersArray.length);
        console.log("First user sample:", usersArray[0]);

        const mappedUsers = usersArray.map((user, index) => ({
          id: user.id || user.user_id || index + 1,
          name:
            user.name ||
            user.full_name ||
            user.username ||
            user.first_name ||
            "Unknown",
          role:
            user.role || user.position || user.job_title || user.title || "N/A",
          reportsTo:
            user.reports_to_name ||
            user.reportsTo ||
            user.manager ||
            user.supervisor ||
            user.reports_to ||
            "N/A",
          jurisdictionType:
            user.jurisdiction_type ||
            user.jurisdictionType ||
            user.dept_type ||
            user.department_type ||
            "N/A",
          jurisdictionName:
            user.jurisdiction_name ||
            user.jurisdictionName ||
            user.department ||
            user.dept_name ||
            "N/A",
          phoneNumber:
            user.phone_number ||
            user.phoneNumber ||
            user.phone ||
            user.mobile ||
            user.contact ||
            "N/A",
          groupId:
            user.grp_id ||
            user.group_id ||
            user.groupId ||
            user.team_id ||
            user.team ||
            "N/A",
          rankLevel:
            user.rank_level || user.rankLevel || user.level || user.rank || 0,
        }));

        console.log("Mapped users:", mappedUsers);
        console.log("Setting users state with", mappedUsers.length, "users");

        setUsers(mappedUsers);
        console.log("Successfully fetched and mapped users:", mappedUsers);
        hasFetchedRef.current = true;
      } else {
        const errorMsg =
          response.response?.message ||
          response.message ||
          "Unexpected API response format";
        console.error("API returned unsuccessful status:", response);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      let errorMessage = "Failed to fetch users";

      if (err.name === "TypeError" && err.message.includes("fetch")) {
        errorMessage =
          "Cannot connect to server. Please ensure the API is running on http://localhost:8001";
      } else {
        errorMessage = err.message || "An unexpected error occurred";
      }

      setError(errorMessage);
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchUsers();
    }
  }, []);

  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    hasFetchedRef.current = false;
    setUsers([]);
    setError(null);
    await fetchUsers();
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading users...</p>
            <p className="text-sm text-gray-500 mt-2">
              Fetching data from API with query: "get all users"
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-50">
        <Sidebar />
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center max-w-lg">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Users
            </h3>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <p>
                • Make sure your API server is running on http://localhost:8001
              </p>
              <p>• Check that the /users endpoint is available</p>
              <p>• Verify your network connection</p>
              <p>• Query sent: "get all users"</p>
            </div>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2 mx-auto"
            >
              <RefreshCw className="w-4 h-4" /> Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Team Directory
              </h1>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {users.length} {users.length === 1 ? "user" : "users"}
                </span>
                <div
                  className="w-2 h-2 bg-green-400 rounded-full"
                  title="API Connected"
                ></div>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                  Query: "get all users"
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleRefresh}
                className="px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
                disabled={loading}
              >
                <RefreshCw
                  className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No users available
                </h3>
                <p className="text-gray-500">
                  No users have been loaded from the API yet. The query "get all
                  users" returned no results.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-900 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="px-6 py-3 border-b font-semibold uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 border-b font-semibold uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 border-b font-semibold uppercase tracking-wider">
                        Reports To
                      </th>
                      <th className="px-6 py-3 border-b font-semibold uppercase tracking-wider">
                        Jurisdiction Type
                      </th>
                      <th className="px-6 py-3 border-b font-semibold uppercase tracking-wider">
                        Jurisdiction Name
                      </th>
                      <th className="px-6 py-3 border-b font-semibold uppercase tracking-wider">
                        Phone Number
                      </th>
                      <th className="px-6 py-3 border-b font-semibold uppercase tracking-wider">
                        Group ID
                      </th>
                      <th className="px-6 py-3 border-b font-semibold uppercase tracking-wider text-center">
                        Rank Level
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr
                        key={user.id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 border-b">
                          <div className="font-medium text-gray-900">
                            {user.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 border-b text-gray-700">
                          {user.role}
                        </td>
                        <td className="px-6 py-4 border-b text-gray-700">
                          {user.reportsTo}
                        </td>
                        <td className="px-6 py-4 border-b text-gray-700">
                          {user.jurisdictionType}
                        </td>
                        <td className="px-6 py-4 border-b text-gray-700">
                          {user.jurisdictionName}
                        </td>
                        <td className="px-6 py-4 border-b text-gray-700">
                          <span className="font-mono text-sm">
                            {user.phoneNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b text-gray-700">
                          <span className="font-mono text-sm">
                            {user.groupId}
                          </span>
                        </td>
                        <td className="px-6 py-4 border-b text-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            Level {user.rankLevel}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDirectory;
