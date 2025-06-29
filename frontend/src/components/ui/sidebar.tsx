import {
  Home,
  FileText,
  Users,
  Shield,
  UserCheck,
  CheckSquare,
  LogOut,
  Upload,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="w-16 bg-slate-900 flex flex-col items-center py-6 space-y-6">
      <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
        <Shield className="w-5 h-5 text-white" />
      </div>
      <div className="flex flex-col space-y-4">
        <div
          className={`w-10 h-10 ${
            currentPath === "/dashboard" ? "bg-blue-600" : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/dashboard")}
        >
          <Home className="w-5 h-5 text-white" />
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/summarizer" ? "bg-blue-600" : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/summarizer")}
        >
          <FileText className="w-5 h-5 text-white" />
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/task-allocation"
              ? "bg-blue-600"
              : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/task-allocation")}
        >
          <UserCheck className="w-5 h-5 text-white" />
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/my-tasks" ? "bg-blue-600" : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/my-tasks")}
        >
          <CheckSquare className="w-5 h-5 text-white" />
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/team-directory"
              ? "bg-blue-600"
              : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/team-directory")}
        >
          <Users className="w-5 h-5 text-white" />
        </div>
        <div
          className={`w-10 h-10 ${
            currentPath === "/upload" ? "bg-blue-600" : "hover:bg-slate-800"
          } rounded-lg flex items-center justify-center cursor-pointer`}
          onClick={() => navigate("/upload")}
        >
          <Upload className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="flex-1"></div>
      <div className="flex flex-col space-y-4">
        <div
          className="w-10 h-10 hover:bg-slate-800 rounded-lg flex items-center justify-center cursor-pointer relative"
          onClick={() => navigate("/login")}
        >
          <LogOut className="w-5 h-5 text-slate-400" />
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
