import MyAssignedTasks from "@/components/dashboard/assigned-task";
import RecentChatSummaries from "@/components/dashboard/recent-chat";
import JuniorTaskStatus from "@/components/dashboard/task-allocation-list";
import TeamDirectory from "@/components/dashboard/team-directory";
import UserProfile from "@/components/dashboard/user-profile";
import Header from "@/components/header";
import Sidebar from "@/components/ui/sidebar";
import { useLocation } from "react-router-dom";

// Types for shared data structures
interface Task {
  id: number;
  title: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  deadline: string;
  status: "In Progress" | "Pending" | "Planning" | "Completed";
  assignedBy: string;
}

interface JuniorTask {
  officer: string;
  task: string;
  status: "In Progress" | "Completed" | "Pending";
  priority: "High" | "Medium" | "Low";
  location: string;
  timeAssigned: string;
}

interface ChatSummary {
  id: number;
  chatName: string;
  summary: string;
  lastSummarized: string;
  messageCount: number;
  priority: "High" | "Medium" | "Low";
}

interface TeamMember {
  id: number;
  name: string;
  rank: string;
  badge: string;
  status: "On Duty" | "Available" | "On Leave";
  currentTask: string;
  phone: string;
}

interface UserProfileData {
  name: string;
  rank: string;
  badge: string;
  department: string;
  station: string;
  email: string;
  phone: string;
  yearsOfService: number;
  currentStatus: "On Duty" | "Available" | "On Leave";
  location: string;
}

const Dashboard = () => {
  const location = useLocation();
  const role = location.state?.role || "SP"; // Default to SI if no role is found

  const currentDate = new Date();

  // User Profile Data
  const userProfile: UserProfileData = {
    name: "Senior Inspector Rajesh Malhotra",
    rank: role === "SI" ? "Sub-Inspector" : "Superintendent of Police",
    badge: "SI-1001",
    department: "City Police Department",
    station: "Central Police Station",
    email: "rajesh.malhotra@police.gov.in",
    phone: "+91-9876543200",
    yearsOfService: 15,
    currentStatus: "On Duty",
    location: "Command Center",
  };

  // Junior officers task status
  const juniorTaskStatus: JuniorTask[] = [
    {
      officer: "Constable Sharma",
      task: "Patrol Sector A-2",
      status: "In Progress",
      priority: "High",
      location: "Commercial District",
      timeAssigned: "08:00 AM",
    },
    {
      officer: "Head Constable Patel",
      task: "Traffic Violation Report",
      status: "Completed",
      priority: "Medium",
      location: "Highway Junction",
      timeAssigned: "09:30 AM",
    },
    {
      officer: "Constable Kumar",
      task: "Incident Investigation",
      status: "Pending",
      priority: "High",
      location: "Residential Area",
      timeAssigned: "10:15 AM",
    },
    {
      officer: "Constable Singh",
      task: "Document Collection",
      status: "In Progress",
      priority: "Low",
      location: "Station House",
      timeAssigned: "11:00 AM",
    },
  ];

  // Tasks assigned to officer
  const myAssignedTasks: Task[] = [
    {
      id: 1,
      title: "Monthly Crime Statistics Review",
      description: "Compile and analyze monthly crime data for district report",
      priority: "High",
      deadline: "Today, 5:00 PM",
      status: "In Progress",
      assignedBy: "Inspector General",
    },
    {
      id: 2,
      title: "Team Performance Evaluation",
      description: "Conduct quarterly performance review for junior officers",
      priority: "Medium",
      deadline: "Tomorrow, 2:00 PM",
      status: "Pending",
      assignedBy: "Deputy Commissioner",
    },
    {
      id: 3,
      title: "Community Outreach Program",
      description: "Organize safety awareness session for local schools",
      priority: "Low",
      deadline: "Next Week",
      status: "Planning",
      assignedBy: "Station Commander",
    },
  ];

  // Recent Chat Summaries
  const chatSummaries: ChatSummary[] = [
    {
      id: 1,
      chatName: "Police Control Room Group",
      summary:
        "Emergency dispatch reported multiple incidents in Sector B-4. Backup units deployed. All situations under control.",
      lastSummarized: "10 min ago",
      messageCount: 24,
      priority: "High",
    },
    {
      id: 2,
      chatName: "Night Shift Coordination",
      summary:
        "Patrol reports completed for all sectors. Minor traffic violations recorded. No major incidents reported during night shift.",
      lastSummarized: "2 hours ago",
      messageCount: 12,
      priority: "Medium",
    },
    {
      id: 3,
      chatName: "Traffic Management Unit",
      summary:
        "Road closure at Main Street resolved. Accident investigation completed. Traffic flow restored to normal.",
      lastSummarized: "4 hours ago",
      messageCount: 18,
      priority: "Medium",
    },
    {
      id: 4,
      chatName: "Investigation Team",
      summary:
        "Evidence collection completed for Case #1247. Witness statements recorded. Report submitted for review.",
      lastSummarized: "6 hours ago",
      messageCount: 8,
      priority: "Low",
    },
  ];

  // Team members
  const teamMembers: TeamMember[] = [
    {
      id: 1,
      name: "Constable Sharma",
      rank: "Police Constable",
      badge: "PC-2401",
      status: "On Duty",
      currentTask: "Patrol",
      phone: "+91-9876543210",
    },
    {
      id: 2,
      name: "Head Constable Patel",
      rank: "Head Constable",
      badge: "HC-1205",
      status: "Available",
      currentTask: "Station Duty",
      phone: "+91-9876543211",
    },
    {
      id: 3,
      name: "Constable Kumar",
      rank: "Police Constable",
      badge: "PC-2402",
      status: "On Duty",
      currentTask: "Investigation",
      phone: "+91-9876543212",
    },
    {
      id: 4,
      name: "Constable Singh",
      rank: "Police Constable",
      badge: "PC-2403",
      status: "On Leave",
      currentTask: "Off Duty",
      phone: "+91-9876543213",
    },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header currentDate={currentDate} />
        <div className="flex-1 p-8 overflow-auto w-full">
          {role === "SI" ? (
            <>
              {/* Top Section: UserProfile and MyAssignedTasks (50/50) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 w-full">
                <UserProfile profile={userProfile} role={role} />
                <MyAssignedTasks tasks={myAssignedTasks} />
              </div>
              {/* Bottom Section: RecentChatSummaries and TeamDirectory (50/50) */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                <RecentChatSummaries summaries={chatSummaries} />
                <TeamDirectory members={teamMembers} />
              </div>
            </>
          ) : (
            <>
              {/* Original SP Dashboard */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8 w-full">
                <UserProfile profile={userProfile} role={role} />
                <JuniorTaskStatus tasks={juniorTaskStatus} />
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full">
                <MyAssignedTasks tasks={myAssignedTasks} />
                <RecentChatSummaries summaries={chatSummaries} />
                <TeamDirectory members={teamMembers} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
