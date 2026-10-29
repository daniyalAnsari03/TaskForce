"use client";

import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useReducedMotion,
} from "framer-motion";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createTask } from "@/lib/api";
import type { TaskListItem } from "@/lib/types";
import ChatInput from "./ChatInput";
import EmptyState from "./EmptyState";
import {
  ACTIVE_STATUSES,
  CHAT_COPY,
  EASE,
  type ToolName,
} from "./constants";
import { useRunLifecycle, useTaskHistory, useToolState } from "./hooks";
import MessageList from "./MessageList";
import MobileTopBar from "./MobileTopBar";
import Sidebar from "./Sidebar";

export default function ChatLayout() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const runId = searchParams.get("run");
  const reducedMotion = useReducedMotion();
  const [goal, setGoal] = useState("");
  const [conversationGoal, setConversationGoal] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [streamTaskId, setStreamTaskId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const {
    tools,
    toggleTool,
    requireApproval,
    toggleApproval,
    resetTools,
  } = useToolState();
  const { tasks, loading: historyLoading, error: historyError, refresh } =
    useTaskHistory();
  const handleFinished = useCallback(() => {
    void refresh();
  }, [refresh]);
  const { task, error: pollingError, loading: taskLoading } =
    useRunLifecycle(runId, handleFinished);
  const running =
    task !== null &&
    ACTIVE_STATUSES.includes(task.status as (typeof ACTIVE_STATUSES)[number]);
  const busy = submitting || running || (runId !== null && taskLoading);
  const pending =
    pollingError === null &&
    (submitting ||
      running ||
      (runId !== null && taskLoading && streamTaskId === runId));

  useEffect(() => {
    if (!drawerOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDrawerOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [drawerOpen]);

  const startTask = useCallback(
    async (rawGoal: string) => {
      const cleanGoal = rawGoal.trim();
      if (!cleanGoal || busy) return;
      setSubmitting(true);
      setSubmitError(null);
      try {
        const { id } = await createTask({
          goal: cleanGoal,
          tools,
          require_approval: requireApproval,
        });
        setStreamTaskId(id);
        setConversationGoal(cleanGoal);
        setGoal("");
        void refresh();
        router.push(`/new?run=${encodeURIComponent(id)}`);
      } catch (reason) {
        setSubmitError(
          reason instanceof Error ? reason.message : CHAT_COPY.requestError,
        );
      } finally {
        setSubmitting(false);
      }
    },
    [busy, requireApproval, router, refresh, tools],
  );

  const handleNewTask = useCallback(() => {
    setGoal("");
    setConversationGoal("");
    setStreamTaskId(null);
    setSubmitError(null);
    resetTools();
    setDrawerOpen(false);
    router.push("/new");
  }, [resetTools, router]);

  const handleSelectTask = useCallback(
    (selected: TaskListItem) => {
      setConversationGoal(selected.goal);
      setStreamTaskId(null);
      setSubmitError(null);
      setDrawerOpen(false);
      router.push(`/new?run=${encodeURIComponent(selected.id)}`);
    },
    [router],
  );

  const handleToggleTool = useCallback(
    (name: ToolName) => toggleTool(name),
    [toggleTool],
  );

  const input = (
    <ChatInput
      goal={goal}
      onGoalChange={setGoal}
      tools={tools}
      onToggleTool={handleToggleTool}
      requireApproval={requireApproval}
      onToggleApproval={toggleApproval}
      onSubmit={() => void startTask(goal)}
      busy={busy}
    />
  );

  return (
    <LayoutGroup>
      <div className="chat-page flex h-dvh w-full overflow-hidden bg-[#262624] text-[#eee]">
        <div className="hidden h-full w-[260px] shrink-0 lg:block">
          <Sidebar
            tasks={tasks}
            loading={historyLoading}
            error={historyError}
            activeId={runId}
            tools={tools}
            onToggleTool={handleToggleTool}
            onNewTask={handleNewTask}
            onSelectTask={handleSelectTask}
            pending={pending}
          />
        </div>

        <AnimatePresence>
          {drawerOpen && (
            <motion.div
              className="fixed inset-0 z-40 lg:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: EASE }}
            >
              <button
                type="button"
                aria-label={CHAT_COPY.close}
                onClick={() => setDrawerOpen(false)}
                className="absolute inset-0 bg-black/50 focus-visible:outline-2 focus-visible:outline-[#3b82f6]"
              />
              <motion.div
                initial={reducedMotion ? { opacity: 0 } : { x: "-100%" }}
                animate={reducedMotion ? { opacity: 1 } : { x: 0 }}
                exit={reducedMotion ? { opacity: 0 } : { x: "-100%" }}
                transition={{
                  duration: reducedMotion ? 0.01 : 0.5,
                  ease: EASE,
                }}
                className="relative h-full w-[min(300px,85vw)]"
              >
                <Sidebar
                  tasks={tasks}
                  loading={historyLoading}
                  error={historyError}
                  activeId={runId}
                  tools={tools}
                  onToggleTool={handleToggleTool}
                  onNewTask={handleNewTask}
                  onSelectTask={handleSelectTask}
                  pending={pending}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <MobileTopBar
            onOpenMenu={() => setDrawerOpen(true)}
            onNewTask={handleNewTask}
            pending={pending}
          />
          <AnimatePresence mode="wait" initial={false}>
            {runId ? (
              <motion.div
                key="conversation"
                initial={reducedMotion ? { opacity: 0.99 } : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: EASE }}
                className="flex min-h-0 flex-1 flex-col"
              >
                <MessageList
                  goal={conversationGoal || task?.goal || ""}
                  task={task}
                  loading={taskLoading}
                  pollingError={pollingError}
                  animateTaskId={streamTaskId}
                  onRetry={() => {
                    if (conversationGoal) void startTask(conversationGoal);
                  }}
                />
                <motion.div
                  layoutId="chat-input"
                  transition={{
                    duration: reducedMotion ? 0.01 : 0.8,
                    ease: EASE,
                  }}
                  className="shrink-0 px-4 pb-[max(16px,env(safe-area-inset-bottom))] sm:px-6 lg:px-10 lg:pb-7"
                >
                  <div className="mx-auto w-full max-w-[720px]">{input}</div>
                  {submitError && (
                    <p role="alert" className="mx-auto mt-2 max-w-[720px] text-sm text-[#f0b44c]">
                      {submitError}
                    </p>
                  )}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: EASE }}
                className="flex min-h-0 flex-1 flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-10"
              >
                <div className="mx-auto flex w-full max-w-[720px] flex-col items-center gap-7">
                  <AnimatePresence mode="wait">
                    <EmptyState key="empty-copy" />
                  </AnimatePresence>
                  <motion.div
                    layoutId="chat-input"
                    transition={{
                      duration: reducedMotion ? 0.01 : 0.8,
                      ease: EASE,
                    }}
                    className="w-full"
                  >
                    {input}
                    {submitError && (
                      <p role="alert" className="mt-2 text-sm text-[#f0b44c]">
                        {submitError}
                      </p>
                    )}
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </LayoutGroup>
  );
}
