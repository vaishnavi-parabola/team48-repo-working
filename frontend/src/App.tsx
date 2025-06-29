import Login from "./pages/login/login";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignUp from "./pages/sign-up/sign-up";
import Dashboard from "./pages/dashboard";
import TaskAllocationPage from "./pages/task-allocation";
import Summarizer from "./pages/summarizer";
import MyTasks from "./pages/my-tasks/my-tasks";
import UploadPage from "./pages/upload-page";
import AllTasks from "./pages/all-tasks";
import TeamDirectory from "./pages/team-directory";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/sign-up" element={<SignUp />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/task-allocation" element={<TaskAllocationPage />} />
        <Route path="/summarizer" element={<Summarizer />} />
        <Route path="/my-tasks" element={<MyTasks />} />
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/all-tasks" element={<AllTasks />} />
        <Route path="team-directory" element={<TeamDirectory />} />
      </Routes>
    </Router>
  );
}

export default App;
