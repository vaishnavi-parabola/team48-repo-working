import { Clock } from "lucide-react";
import { Link } from 'react-router-dom'; 

interface Task {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "In Progress" | "Pending" | "Planning" | "Completed";
  assignedBy: string;
}

interface MyAssignedTasksProps {
  tasks: Task[];
}

const MyAssignedTasks: React.FC<MyAssignedTasksProps> = ({ tasks }) => {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm h-auto">
      <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">My Assigned Tasks</h2>
                <Link
                    to="/task-allocation"
                    className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                    View All
                </Link>
            </div>
      <div className="space-y-4">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-medium text-gray-900 text-sm">
                {task.title}
              </h3>
              <span
                className={`text-sm font-medium ${
                  task.priority === "High"
                    ? "text-red-600"
                    : task.priority === "Medium"
                    ? "text-yellow-600"
                    : "text-green-600"
                }`}
              >
                {task.priority}
              </span>
            </div>
            <p className="text-xs text-gray-600 mb-3">{task.description}</p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>By: {task.assignedBy}</span>
              <div className="flex items-center space-x-1">
                <Clock className="w-3 h-3" />
                <span>{task.deadline}</span>
              </div>
            </div>
            <div className="mt-2">
              <span
                className={`text-sm font-medium ${
                  task.status === "Completed"
                    ? "text-green-600"
                    : task.status === "In Progress"
                    ? "text-blue-600"
                    : "text-orange-600"
                }`}
              >
                {task.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyAssignedTasks;
