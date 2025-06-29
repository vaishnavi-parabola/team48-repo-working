import React, { useState, useEffect } from "react";
import {
  Clock,
  User,
  Calendar,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Sidebar from "@/components/ui/sidebar";
import { queryUserTasks } from "@/api/api";

export type Task = {
  id?: number;
  title: string;
  dueDate: string;
  stage: string;
  priority: string;
  assignedBy: string;
  completed?: boolean;
};

const MyTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fetched, setFetched] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await queryUserTasks("91 8328414722");
      if (
        response.status === "success" &&
        response.response.status === "success"
      ) {
        const assignedToUserTasks = (
          response.response.response.assigned_to_user || []
        ).map((task: any, index: number) => ({
          id: index + 1,
          title: task.task_name || "Unnamed Task",
          dueDate: task.deadline.includes(" ")
            ? task.deadline
            : `${task.deadline} ${task.timestamp || ""}`,
          stage: task.status || "N/A",
          priority: task.priority || "N/A",
          assignedBy: task.assigned_by || "N/A",
          completed: task.status === "Completed",
        }));
        setTasks(assignedToUserTasks);
      } else if (response.response.message) {
        throw new Error(response.response.message);
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (err) {
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
      setFetched(true);
    }
  };

  useEffect(() => {
    let isMounted = true;
    if (!fetched && isMounted) {
      fetchTasks();
    }
    return () => {
      isMounted = false;
    };
  }, [fetched]);

  const handleRefresh = () => {
    setFetched(false);
    setTasks([]);
    setError(null);
  };

  const filteredTasks = tasks.filter(
    (task) =>
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const tasksByDate = Object.entries(
    filteredTasks.reduce((acc, task) => {
      const date = task.dueDate.split(" ")[0];
      if (!acc[date]) acc[date] = [];
      acc[date].push(task);
      return acc;
    }, {})
  ).sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime());

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
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <p className="text-lg text-gray-600">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Retry
            </button>
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
                  My Tasks
                </h1>
                <p className="text-gray-600 text-sm">
                  Manage and track your assigned tasks efficiently
                </p>
              </div>
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks or assigned by..."
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
                    : "No tasks assigned to you at the moment"}
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
                        <div className="col-span-3 text-sm font-semibold">
                          Task
                        </div>
                        <div className="col-span-2 text-sm font-semibold">
                          Due Date
                        </div>
                        <div className="col-span-2 text-sm font-semibold">
                          Stage
                        </div>
                        <div className="col-span-2 text-sm font-semibold">
                          Priority
                        </div>
                        <div className="col-span-3 text-sm font-semibold">
                          Assigned By
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
                              {/* Task Title */}
                              <div className="col-span-3">
                                <h3 className="font-medium text-gray-900 text-sm leading-tight">
                                  {task.title}
                                </h3>
                              </div>

                              {/* Due Date */}
                              <div className="col-span-2 text-gray-700 text-sm">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4 text-gray-400" />
                                  <span>{task.dueDate}</span>
                                </div>
                              </div>

                              {/* Stage */}
                              <div className="col-span-2">
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStageColor(
                                    task.stage
                                  )}`}
                                >
                                  {task.stage}
                                </span>
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

                              {/* Assigned By */}
                              <div className="col-span-3 text-gray-800 text-sm">
                                <div className="flex items-center gap-1">
                                  <User className="w-4 h-4 text-gray-400" />
                                  <span className="truncate">
                                    {task.assignedBy}
                                  </span>
                                </div>
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

const getPriorityColor = (priority) => {
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

const getStageColor = (stage) => {
  switch (stage) {
    case "In Progress":
      return "bg-blue-50 text-blue-700 border border-blue-200";
    case "Pending":
      return "bg-orange-50 text-orange-700 border border-orange-200";
    case "Planning":
      return "bg-purple-50 text-purple-700 border border-purple-200";
    case "Completed":
      return "bg-green-50 text-green-700 border border-green-200";
    case "Assigned":
      return "bg-indigo-50 text-indigo-700 border border-indigo-200";
    default:
      return "bg-gray-50 text-gray-700 border border-gray-200";
  }
};

export default MyTasks;
