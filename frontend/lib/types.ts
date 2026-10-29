export type TaskStatus =
  | "queued"
  | "running"
  | "waiting_approval"
  | "completed"
  | "failed";

export type ToolCallStatus = "running" | "ok" | "failed";

export type CreateTaskRequest = {
  goal: string;
  tools: string[];
  require_approval: boolean;
};

export type CreateTaskResponse = {
  id: string;
};

export type TaskListItem = {
  id: string;
  goal: string;
  status: TaskStatus;
  created_at: string;
};

export type TaskStep = {
  id: string;
  task_id: string;
  agent: string;
  step_index: number;
  status: "waiting" | "working" | "done" | "failed";
  message: string | null;
  started_at: string | null;
  finished_at: string | null;
};

export type ToolCall = {
  id: string;
  task_id: string;
  step_id: string | null;
  tool_name: string;
  input: Record<string, unknown> | null;
  output: Record<string, unknown> | unknown[] | null;
  status: ToolCallStatus;
  created_at: string;
};

export type TaskDetail = {
  id: string;
  goal: string;
  status: TaskStatus;
  enabled_tools: string[];
  require_approval: boolean;
  summary: string | null;
  error_message: string | null;
  created_at: string;
  started_at: string | null;
  finished_at: string | null;
  steps: TaskStep[];
  tool_calls: ToolCall[];
};
