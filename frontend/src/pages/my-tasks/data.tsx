export type Task = {
  title: string;
  dueDate: string;
  stage: string;
  priority: string;
  assignee: string;
};
export const tasks = [
  {
    title: "Monthly Crime Statistics Review",
    dueDate: "2025-06-28 5:00 PM",
    stage: "In Progress",
    priority: "High",
    assignee: "Senior Inspector Rajesh Malhotra",
  },
  {
    title: "Team Performance Evaluation",
    dueDate: "2025-06-28 2:00 PM",
    stage: "Pending",
    priority: "Medium",
    assignee: "Head Constable Patel",
  },
  {
    title: "Community Outreach Program",
    dueDate: "2025-06-27 10:00 AM",
    stage: "Planning",
    priority: "Low",
    assignee: "Constable Sharma",
  },
  {
    title: "Traffic Violation Report",
    dueDate: "2025-06-27 9:30 AM",
    stage: "Completed",
    priority: "Medium",
    assignee: "Constable Kumar",
  },
  {
    title: "Incident Investigation Follow-up",
    dueDate: "2025-06-26 3:00 PM",
    stage: "In Progress",
    priority: "High",
    assignee: "Constable Singh",
  },
];
