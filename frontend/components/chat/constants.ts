import {
  Code,
  FileText,
  Mail,
  Search,
  type LucideIcon,
} from "lucide-react";

export const CHAT_COPY = {
  brand: "TaskForce",
  navigation: "Task navigation",
  newTask: "New task",
  toolsLabel: "TOOLS",
  historyLabel: "HISTORY",
  noTasks: "No tasks yet",
  historyError: "Could not load tasks.",
  taskError: "Could not load task.",
  requestError: "Could not start task.",
  multiAgent: "Multi-agent system",
  heading: "Set a goal. Agents do the work.",
  subtitle: "Research, code, reports and email. Watch everything live and get real files.",
  placeholder: "Write your goal. The manager handles the rest.",
  addTools: "Add tools",
  send: "Send",
  menu: "Open sidebar",
  close: "Close sidebar",
  approval: "Ask for my approval before sending email",
  approvalOn: "On",
  approvalOff: "Off",
  working: "Agents are working...",
  waiting: "Waiting",
  inProgress: "In progress",
  failed: "Task failed",
  tryAgain: "Try again",
  search: { name: "Web search", description: "Search the internet" },
  files: { name: "Files", description: "Create and read files" },
  code: { name: "Code", description: "Run code" },
  email: { name: "Email", description: "Send email" },
} as const;

export type ToolName = "Web search" | "Files" | "Code" | "Email";

export const TOOL_OPTIONS: {
  name: ToolName;
  description: string;
  icon: LucideIcon;
}[] = [
  { name: CHAT_COPY.search.name, description: CHAT_COPY.search.description, icon: Search },
  { name: CHAT_COPY.files.name, description: CHAT_COPY.files.description, icon: FileText },
  { name: CHAT_COPY.code.name, description: CHAT_COPY.code.description, icon: Code },
  { name: CHAT_COPY.email.name, description: CHAT_COPY.email.description, icon: Mail },
];

export const DEFAULT_TOOLS: ToolName[] = [
  CHAT_COPY.search.name,
  CHAT_COPY.files.name,
  CHAT_COPY.email.name,
];

export const ACTIVE_STATUSES = ["queued", "running", "waiting_approval"] as const;
export const FINAL_STATUSES = ["completed", "failed"] as const;
export const EASE = [0.22, 1, 0.36, 1] as const;
