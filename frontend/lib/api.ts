import type {
  CreateTaskRequest,
  CreateTaskResponse,
  TaskListItem,
  TaskDetail,
} from "./types";

const API_URL: string =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";

export function getApiUrl(): string {
  return API_URL;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new Error("Backend se connect nahi ho paya. Kya backend chal raha hai?");
  }

  let body: unknown = null;
  try {
    body = await response.json();
  } catch {
    // leave body null
  }

  if (!response.ok) {
    const detail = (body as { detail?: unknown } | null)?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail
              .map(
                (item) =>
                  (item as { msg?: string } | null)?.msg ?? "Validation error",
              )
              .join(", ")
          : `Request failed (HTTP ${response.status})`;
    throw new Error(message);
  }

  return body as T;
}

export function createTask(
  input: CreateTaskRequest,
): Promise<CreateTaskResponse> {
  return request<CreateTaskResponse>("/tasks", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getTask(id: string): Promise<TaskDetail> {
  return request<TaskDetail>(`/tasks/${id}`);
}

export function listTasks(): Promise<TaskListItem[]> {
  return request<TaskListItem[]>("/tasks");
}
