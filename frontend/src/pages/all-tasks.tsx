import React, { useState, useEffect } from "react";
import { Clock, User, Calendar, Search } from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import { queryTask } from "@/api/api";

export type Task = {
  id?: number;
  name: string;
  task_name: string;
  assigned_by: string;
  priority: string;
  deadline: string;
  status: string;
};

const AllTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await queryTask("GRP_DCB_VZM"); // Hardcoded group ID
        console.log("API Response:", response); // Log to verify
        if (response.status === "success") {
          let parsedResponse;
          try {
            // Parse the outer response.response string
            parsedResponse = JSON.parse(response.response);
            if (
              parsedResponse.status === "success" &&
              Array.isArray(parsedResponse.response)
            ) {
              const mappedTasks = parsedResponse.response.map(
                (task: any, index: number) => ({
                  id: index + 1,
                  name: task.name,
                  task_name: task.task_name,
                  assigned_by: task.assigned_by,
                  priority: task.priority,
                  deadline: task.deadline.includes(" ")
                    ? task.deadline
                    : `${task.deadline} ${task.timestamp || ""}`,
                  status: task.status,
                })
              );
              setTasks(mappedTasks);
            } else {
              setError(
                "Unexpected data format: nested response is not an array."
              );
            }
          } catch (parseError) {
            setError("Failed to parse API response.");
            console.error("Parse Error:", parseError);
          }
        } else {
          setError("Failed to fetch tasks.");
        }
      } catch (err) {
        setError("An error occurred while fetching tasks.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter(
    (task) =>
      task.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.task_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assigned_by.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tasksByDate = Object.entries(
    filteredTasks.reduce((acc, task) => {
      const date = task.deadline.split(" ")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {})
  ).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-50 text-red-700 border border-red-200";
      case "Medium":
        return "bg-yellow-50 text-yellow-700 border border-yellow-200";
      case "Low":
        return "bg-green-50 text-green-700 border border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-50 text-blue-700 border border-blue-200";
      case "Pending":
        return "bg-orange-50 text-orange-700 border border-orange-200";
      case "Completed":
        return "bg-green-50 text-green-700 border border-green-200";
      default:
        return "bg-gray-50 text-gray-700 border border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Clock className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-lg text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-white">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header Section */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200 px-6 py-6 sticky top-0 z-10">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
                  All Tasks
                </h1>
                <p className="text-gray-600 text-sm">
                  View and manage all assigned tasks efficiently
                </p>
              </div>
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, task, or assignee..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-72 pl-10 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-600 transition-all duration-200 text-gray-800 placeholder-gray-500 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tasks Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-7xl mx-auto">
            {tasksByDate.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-18 h-18 bg-blue-50 backdrop-blur-sm rounded-xl flex items-center justify-center mx-auto mb-4 border border-blue-200">
                  <Clock className="w-9 h-9 text-blue-600" />
                </div>
                <h3 className="text-lg font-light text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  {searchTerm
                    ? "Try adjusting your search terms"
                    : "No tasks available at the moment"}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {tasksByDate.map(([date, dateTasks]) => (
                  <div key={date} className="group">
                    {/* Date Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                        <Calendar className="w-5 h-5 text-blue-600" />
                        <span className="text-sm font-medium text-gray-900">
                          {date}
                        </span>
                        <span className="bg-blue-50 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
                          {dateTasks.length}{" "}
                          {dateTasks.length === 1 ? "task" : "tasks"}
                        </span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-200 to-transparent"></div>
                    </div>

                    {/* Table Header */}
                    <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-t-xl">
                      <div className="grid grid-cols-12 gap-3 items-center">
                        <div className="col-span-2 text-sm font-semibold">
                          Name
                        </div>
                        <div className="col-span-3 text-sm font-semibold">
                          Task
                        </div>
                        <div className="col-span-2 text-sm font-semibold">
                          Assigned By
                        </div>
                        <div className="col-span-2 text-sm font-semibold">
                          Priority
                        </div>
                        <div className="col-span-2 text-sm font-semibold">
                          Deadline
                        </div>
                        <div className="col-span-1 text-sm font-semibold">
                          Status
                        </div>
                      </div>
                    </div>

                    {/* Tasks Table */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-b-xl border border-gray-200 border-t-0 shadow-sm">
                      <div className="divide-y divide-gray-100">
                        {dateTasks.map((task) => (
                          <div
                            key={task.id}
                            className="px-5 py-3 hover:bg-blue-50/80 transition-all duration-200 group/task"
                          >
                            <div className="grid grid-cols-12 gap-3 items-center">
                              {/* Name */}
                              <div className="col-span-2">
                                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                  {task.name}
                                </h3>
                              </div>

                              {/* Task */}
                              <div className="col-span-3">
                                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                  {task.task_name}
                                </h3>
                              </div>

                              {/* Assigned By */}
                              <div className="col-span-2 text-gray-700 text-sm">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span>{task.assigned_by}</span>
                                </div>
                              </div>

                              {/* Priority */}
                              <div className="col-span-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              </div>

                              {/* Deadline */}
                              <div className="col-span-2 text-gray-700 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>{task.deadline}</span>
                                </div>
                              </div>

                              {/* Status */}
                              <div className="col-span-1">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    task.status
                                  )}`}
                                >
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllTasks;
