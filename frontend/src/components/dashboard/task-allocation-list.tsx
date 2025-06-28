import { UserCheck, MapPin, Clock, Link } from "lucide-react";

interface JuniorTask {
  officer: string;
  task: string;
  status: "In Progress" | "Completed" | "Pending";
  priority: "High" | "Medium" | "Low";
  location: string;
  timeAssigned: string;
}

interface JuniorTaskStatusProps {
  tasks: JuniorTask[];
}

const JuniorTaskStatus: React.FC<JuniorTaskStatusProps> = ({ tasks }) => {
  return (
    <div className="lg:col-span-3">
      <div className="bg-white rounded-xl p-6 shadow-sm h-[420px] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Junior Officers - Task Status</h2>
          <Link
            to="/task-allocation"
            className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            View All
          </Link>
        </div>
        <div className="space-y-3 flex-1 overflow-y-auto pr-5 custom-scrollbar">
          {tasks.map((task, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {task.officer}
                    </h3>
                    <p className="text-sm text-gray-600">{task.task}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-sm font-medium ${task.status === "Completed"
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
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <MapPin className="w-4 h-4" />
                    <span>{task.location}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{task.timeAssigned}</span>
                  </div>
                </div>
                <span
                  className={`text-sm font-medium ${task.priority === "High"
                      ? "text-red-600"
                      : task.priority === "Medium"
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                >
                  {task.priority}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JuniorTaskStatus;