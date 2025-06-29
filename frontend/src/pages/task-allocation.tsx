import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Search,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  PlayCircle,
  PauseCircle,
  User,
  Target,
  RefreshCw,
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

const TaskAllocationPage: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<[string, string]>(["", ""]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use ref to prevent duplicate calls
  const isFetchingRef = useRef(false);
  const hasFetchedRef = useRef(false);

  const fetchTasks = async () => {
    if (isFetchingRef.current) {
      console.log("Already fetching, skipping duplicate call");
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      console.log("Starting task fetch for assigned by user...");
      const response = await queryUserTasks("91 8328414722");

      if (response.status === "success" && response.response) {
        const actualResponse =
          response.response.status === "success"
            ? response.response.response
            : response.response;

        const assignedByUserTasks = (actualResponse.assigned_by_user || []).map(
          (task: any, index: number) => {
            let dueDate = "";
            if (task.date) {
              dueDate = task.timestamp
                ? `${task.date} ${task.timestamp}`
                : task.date;
            } else if (task.deadline) {
              dueDate = task.deadline;
            }

            return {
              id: index + 1,
              title: task.task_name || "Unnamed Task",
              dueDate: dueDate || "No date specified",
              stage: task.status || "N/A",
              priority: task.priority || "N/A",
              assignedBy: task.assigned_to || "N/A",
              completed: task.status === "Completed",
            };
          }
        );

        setTasks(assignedByUserTasks);
        console.log(
          "Successfully fetched tasks assigned by user:",
          assignedByUserTasks
        );
        hasFetchedRef.current = true;
      } else {
        throw new Error(
          response.response?.message || "Unexpected API response format"
        );
      }
    } catch (err: any) {
      console.error("Error fetching tasks:", err);
      setError(err.message || "Failed to fetch tasks");
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!hasFetchedRef.current) {
      fetchTasks();
    }
  }, []);

  const handleRefresh = async () => {
    console.log("Manual refresh triggered");
    hasFetchedRef.current = false;
    setTasks([]);
    setError(null);
    await fetchTasks();
  };

  const handleDateRangeChange = (type: "start" | "end", value: string) => {
    if (type === "start") {
      setDateRange([value, dateRange[1]]);
    } else {
      setDateRange([dateRange[0], value]);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      task.assignedBy.toLowerCase().includes(searchTerm.toLowerCase());

    const taskDate = task.dueDate.split(" ")[0] || "";
    const [startDate, endDate] = dateRange;

    if (startDate && endDate) {
      return matchesSearch && taskDate >= startDate && taskDate <= endDate;
    }
    return matchesSearch;
  });

  const groupedTasks = filteredTasks.reduce((acc, task) => {
    const key = task.dueDate.split(" ")[0] || "No date";
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {} as Record<string, Task[]>);

  const dateOrder = [
    "2025-06-30",
    "2025-06-29",
    "2025-06-28",
    "2025-06-27",
    "2025-06-26",
    "2025-06-25",
    "2025-06-24",
  ];
  const sortedDates = Object.keys(groupedTasks).sort((a, b) => {
    const indexA = dateOrder.indexOf(a);
    const indexB = dateOrder.indexOf(b);
    if (indexA === -1 && indexB === -1) return a.localeCompare(b);
    if (indexA === -1) return 1;
    if (indexB === -1) return -1;
    return indexA - indexB;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="w-4 h-4" />;
      case "In Progress":
        return <PlayCircle className="w-4 h-4" />;
      case "Pending":
        return <PauseCircle className="w-4 h-4" />;
      case "Not Started":
        return <AlertCircle className="w-4 h-4" />;
      case "Assigned":
        return <User className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "text-green-600 bg-green-50 border-green-200";
      case "In Progress":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "Pending":
        return "text-orange-600 bg-orange-50 border-orange-200";
      case "Not Started":
        return "text-gray-600 bg-gray-50 border-gray-200";
      case "Assigned":
        return "text-indigo-600 bg-indigo-50 border-indigo-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical":
        return "text-red-700 bg-red-100 border-red-300";
      case "High":
        return "text-red-600 bg-red-50 border-red-200";
      case "Medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "Low":
        return "text-green-600 bg-green-50 border-green-200";
      case "General":
        return "text-blue-600 bg-blue-50 border-blue-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
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
      <div className="flex h-screen bg-gray-50">
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
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">
                Task Allocation History
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-2">
                  <input
                    type="date"
                    value={dateRange[0]}
                    onChange={(e) =>
                      handleDateRangeChange("start", e.target.value)
                    }
                    className="pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="text-gray-400">to</span>
                  <input
                    type="date"
                    value={dateRange[1]}
                    onChange={(e) =>
                      handleDateRangeChange("end", e.target.value)
                    }
                    className="pl-2 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task Cards */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {sortedDates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No tasks found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            ) : (
              sortedDates.map((date) => (
                <div key={date} className="mb-8">
                  <div className="flex items-center mb-6">
                    <Calendar className="w-5 h-5 mr-3 text-gray-600" />
                    <h2 className="text-xl font-semibold text-gray-900">
                      {date === "No date" ? "No date specified" : date}
                    </h2>
                    <span className="ml-3 text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {groupedTasks[date].length} tasks
                    </span>
                  </div>

                  <div
                    className="flex overflow-x-auto space-x-6 pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    style={{ minHeight: "400px" }}
                  >
                    {groupedTasks[date].map((task) => (
                      <div
                        key={task.id}
                        className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow w-[350px] snap-start"
                        style={{ minWidth: "350px", flexShrink: 0 }}
                      >
                        <div className="p-6">
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                {task.title}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {task.description || "No description"}
                              </p>
                            </div>
                            <div
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(
                                task.priority
                              )}`}
                            >
                              {task.priority}
                            </div>
                          </div>

                          {/* Status */}
                          <div
                            className={`inline-flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium border mb-4 ${getStatusColor(
                              task.stage
                            )}`}
                          >
                            {getStatusIcon(task.stage)}
                            <span>{task.stage}</span>
                          </div>

                          {/* Details */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <User className="w-4 h-4 text-gray-400" />
                              <div className="text-sm">
                                <span className="text-gray-500">
                                  Assigned to:
                                </span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {task.assignedBy}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Target className="w-4 h-4 text-gray-400" />
                              <div className="text-sm">
                                <span className="text-gray-500">
                                  Assigned by:
                                </span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {"91 8328414722"}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center space-x-3">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <div className="text-sm">
                                <span className="text-gray-500">Assigned:</span>
                                <span className="ml-1 font-medium text-gray-900">
                                  {task.dueDate}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskAllocationPage;
