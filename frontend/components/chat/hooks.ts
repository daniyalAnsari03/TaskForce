"use client";

import { useCallback, useEffect, useState } from "react";
import { getTask, listTasks } from "@/lib/api";
import type { TaskDetail, TaskListItem } from "@/lib/types";
import {
  CHAT_COPY,
  DEFAULT_TOOLS,
  FINAL_STATUSES,
  type ToolName,
} from "./constants";

export function useToolState() {
  const [tools, setTools] = useState<ToolName[]>(DEFAULT_TOOLS);
  const [requireApproval, setRequireApproval] = useState(true);

  const toggleTool = useCallback((name: ToolName) => {
    setTools((current) =>
      current.includes(name)
        ? current.filter((tool) => tool !== name)
        : [...current, name],
    );
  }, []);

  const resetTools = useCallback(() => {
    setTools(DEFAULT_TOOLS);
    setRequireApproval(true);
  }, []);

  return {
    tools,
    toggleTool,
    requireApproval,
    toggleApproval: () => setRequireApproval((current) => !current),
    resetTools,
  };
}

export function useTaskHistory() {
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const history = await listTasks();
      setTasks(history);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : CHAT_COPY.historyError);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const history = await listTasks();
        if (active) {
          setTasks(history);
          setError(null);
        }
      } catch (reason) {
        if (active) {
          setError(
            reason instanceof Error ? reason.message : CHAT_COPY.historyError,
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => {
      active = false;
    };
  }, []);

  return { tasks, loading, error, refresh };
}

export function useRunLifecycle(
  runId: string | null,
  onFinished: () => void,
) {
  const [result, setResult] = useState<{
    runId: string;
    task: TaskDetail;
  } | null>(null);
  const [errorResult, setErrorResult] = useState<{
    runId: string;
    error: string;
  } | null>(null);

  useEffect(() => {
    if (!runId) {
      return;
    }

    let active = true;
    let timer: ReturnType<typeof setInterval> | null = null;
    let wasFinished = false;

    const poll = async () => {
      try {
        const detail = await getTask(runId);
        if (!active) return;
        setResult({ runId, task: detail });
        setErrorResult(null);
        if (
          FINAL_STATUSES.includes(detail.status as (typeof FINAL_STATUSES)[number])
        ) {
          if (!wasFinished) {
            wasFinished = true;
            onFinished();
          }
          if (timer) clearInterval(timer);
          timer = null;
        }
      } catch (reason) {
        if (active) {
          setErrorResult({
            runId,
            error:
              reason instanceof Error ? reason.message : CHAT_COPY.taskError,
          });
        }
      }
    };

    timer = setInterval(() => void poll(), 2000);
    void poll();

    return () => {
      active = false;
      if (timer) clearInterval(timer);
    };
  }, [runId, onFinished]);

  const task = runId && result?.runId === runId ? result.task : null;
  const error =
    runId && errorResult?.runId === runId ? errorResult.error : null;
  const loading = runId !== null && task === null && error === null;

  return { task, error, loading };
}
