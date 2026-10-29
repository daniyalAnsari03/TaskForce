"use client";

// TEMPORARY Phase 2 page: minimal polling run view.
// The full Live Run page (steps timeline, tool calls, files) is built in Phase 4.
// Replace this file then. Design stays in the locked tokens.

import { useParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import Badge from "@/components/ui/Badge";
import Card from "@/components/ui/Card";
import Container from "@/components/ui/Container";
import { getTask } from "@/lib/api";
import type { TaskDetail, TaskStatus } from "@/lib/types";

const statusTone: Record<
  TaskStatus,
  { tone: "accent" | "success" | "warning" | "danger"; label: string }
> = {
  queued: { tone: "accent", label: "Queued" },
  running: { tone: "accent", label: "Running" },
  waiting_approval: { tone: "warning", label: "Waiting approval" },
  completed: { tone: "success", label: "Completed" },
  failed: { tone: "danger", label: "Failed" },
};

const FINAL_STATUSES: TaskStatus[] = ["completed", "failed"];

function RunView() {
  const params = useParams<Record<string, string | string[]>>();
  const id = typeof params?.id === "string" ? params.id : null;
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    let timer: ReturnType<typeof setInterval> | null = null;

    const poll = async () => {
      try {
        const detail = await getTask(id);
        if (!alive) return;
        setTask(detail);
        setError(null);
        if (FINAL_STATUSES.includes(detail.status) && timer) {
          clearInterval(timer);
          timer = null;
        }
      } catch (err) {
        // Keep the last task state; surface fetch errors.
        if (alive) {
          setError(err instanceof Error ? err.message : "Fetch failed.");
        }
      }
    };

    poll();
    timer = setInterval(poll, 2000);

    return () => {
      alive = false;
      if (timer) clearInterval(timer);
    };
  }, [id]);

  const done = task !== null && FINAL_STATUSES.includes(task.status);
  const badge = task ? statusTone[task.status] : null;

  if (!id) {
    return (
      <>
        <Navbar />
        <Container>
          <h1 className="text-[18px] font-medium">Live Run</h1>
          <p className="mt-2 text-[13px] text-muted">Task id na mila.</p>
        </Container>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Container>
        <h1 className="text-[18px] font-medium">Live Run</h1>
        {error && <p className="mt-2 text-xs text-danger">{error}</p>}
        {task === null ? (
          <p className="mt-2 text-[13px] text-muted">Loading…</p>
        ) : (
          <>
            <div className="mt-3 flex items-center gap-2">
              {badge && <Badge tone={badge.tone}>{badge.label}</Badge>}
              <span className="text-xs text-faint">id: {task.id}</span>
            </div>
            <Card className="mt-2">
              <div className="text-xs text-muted">Goal</div>
              <div className="mt-1 text-[13px] text-text">{task.goal}</div>
            </Card>
            {task.status === "completed" && task.summary && (
              <Card className="mt-2">
                <div className="text-xs text-muted">Summary</div>
                <div className="mt-1 whitespace-pre-wrap text-[13px] text-text">
                  {task.summary}
                </div>
              </Card>
            )}
            {task.status === "failed" && (
              <Card className="mt-2">
                <div className="text-xs text-muted">Error</div>
                <div className="mt-1 text-[13px] text-danger">
                  {task.error_message || "Wajah maloom nahi."}
                </div>
              </Card>
            )}
            {!done && (
              <p className="mt-2 text-xs text-muted">Har 2 second refresh…</p>
            )}
          </>
        )}
      </Container>
    </>
  );
}

export default function RunPage() {
  return (
    <div className="px-3 py-2">
      <Suspense fallback={null}>
        <RunView />
      </Suspense>
    </div>
  );
}
