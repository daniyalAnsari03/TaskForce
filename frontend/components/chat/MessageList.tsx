"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Check } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { TaskDetail, TaskStep } from "@/lib/types";
import { ACTIVE_STATUSES, CHAT_COPY, EASE } from "./constants";
import ChatLogo from "./ChatLogo";
import { CHAT_MOTION } from "./motion";
import StreamedText from "./StreamedText";

function isActive(task: TaskDetail | null) {
  return task !== null && ACTIVE_STATUSES.includes(
    task.status as (typeof ACTIVE_STATUSES)[number],
  );
}

function StepStatus({ step }: { step: TaskStep }) {
  const reducedMotion = useReducedMotion();
  if (step.status === "done") {
    return (
      <motion.span
        initial={reducedMotion ? false : { opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: reducedMotion ? 0.01 : 0.4, ease: EASE }}
        className="inline-flex"
      >
        <Check size={15} strokeWidth={2} color="#4ade80" aria-hidden="true" />
      </motion.span>
    );
  }
  if (step.status === "working") {
    return (
      <span
        className="size-[15px] shrink-0 animate-spin rounded-full border-2 border-[#3a3a37] border-t-[#7db3ff]"
        aria-label={CHAT_COPY.inProgress}
      />
    );
  }
  return (
    <span
      className="size-1.5 shrink-0 rounded-full bg-[#8a8a85]"
      aria-hidden="true"
    />
  );
}

type MessageListProps = {
  goal: string;
  task: TaskDetail | null;
  loading: boolean;
  pollingError: string | null;
  animateTaskId: string | null;
  onRetry: () => void;
};

export default function MessageList({
  goal,
  task,
  loading,
  pollingError,
  animateTaskId,
  onRetry,
}: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoScrollEnabled = useRef(true);
  const previousScrollTop = useRef(0);
  const touching = useRef(false);
  const pointerDown = useRef(false);
  const reducedMotion = useReducedMotion();
  const running = isActive(task) || (loading && animateTaskId !== null);
  const steps = task?.steps ?? [];
  const [settledBlocks, setSettledBlocks] = useState<{
    taskId: string | null;
    indexes: Set<number>;
  }>({ taskId: null, indexes: new Set() });

  const responseBlocks = useMemo(() => {
    if (!task || task.status !== "completed") return [];
    const agents = new Map<string, { label: string; messages: string[] }>();
    const canonicalNames = new Map([
      ["manager", "Manager"],
      ["researcher", "Researcher"],
      ["coder", "Coder"],
      ["writer", "Writer"],
      ["reviewer", "Reviewer"],
    ]);

    [...task.steps]
      .sort((left, right) => left.step_index - right.step_index)
      .forEach((step) => {
      if (step.status === "waiting") return;
      const label = canonicalNames.get(step.agent.toLowerCase());
        if (!label) return;
        const agent = agents.get(label) ?? { label, messages: [] };
        if (step.message?.trim()) agent.messages.push(step.message.trim());
        agents.set(label, agent);
      });

    if (agents.size === 0) {
      return task.summary
        ? [{ label: "Result", content: task.summary }]
        : [];
    }

    const blocks = [...agents.values()].map((agent) => ({
      label: agent.label,
      content: agent.messages.join("\n\n"),
    }));
    if (task.summary) {
      const lastBlock = blocks[blocks.length - 1];
      lastBlock.content = lastBlock.content
        ? `${lastBlock.content}\n\n${task.summary}`
        : task.summary;
    }
    return blocks;
  }, [task]);

  const animateResponse =
    task?.status === "completed" &&
    animateTaskId === task.id &&
    responseBlocks.length > 0;
  const allResponseBlocksSettled =
    settledBlocks.taskId === task?.id &&
    settledBlocks.indexes.size >= responseBlocks.length;
  const showResponseLogo = animateResponse && !allResponseBlocksSettled;
  const fullResponseText = responseBlocks
    .map((block) => `${block.label}\n${block.content}`)
    .join("\n\n");
  const markBlockSettled = useCallback(
    (index: number) => {
      if (!task) return;
      setSettledBlocks((current) => {
        const indexes =
          current.taskId === task.id ? new Set(current.indexes) : new Set<number>();
        indexes.add(index);
        return { taskId: task.id, indexes };
      });
    },
    [task],
  );

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;
    previousScrollTop.current = container.scrollTop;
    const trackUserScroll = () => {
      if (
        (touching.current || pointerDown.current) &&
        container.scrollTop < previousScrollTop.current
      ) {
        autoScrollEnabled.current = false;
      }
      previousScrollTop.current = container.scrollTop;
    };
    const trackWheel = (event: WheelEvent) => {
      if (event.deltaY < 0 && container.scrollTop > 0) {
        autoScrollEnabled.current = false;
      }
    };
    const trackKey = (event: KeyboardEvent) => {
      if (["ArrowUp", "PageUp", "Home"].includes(event.key)) {
        autoScrollEnabled.current = false;
      }
    };
    const startTouch = () => {
      touching.current = true;
    };
    const stopTouch = () => {
      touching.current = false;
    };
    const startPointer = (event: PointerEvent) => {
      const bounds = container.getBoundingClientRect();
      if (event.clientX >= bounds.right - 16) pointerDown.current = true;
    };
    const stopPointer = () => {
      pointerDown.current = false;
    };
    container.addEventListener("scroll", trackUserScroll, { passive: true });
    container.addEventListener("wheel", trackWheel, { passive: true });
    container.addEventListener("touchstart", startTouch, { passive: true });
    container.addEventListener("touchend", stopTouch, { passive: true });
    container.addEventListener("touchcancel", stopTouch, { passive: true });
    container.addEventListener("pointerdown", startPointer);
    window.addEventListener("pointerup", stopPointer);
    window.addEventListener("pointercancel", stopPointer);
    container.addEventListener("keydown", trackKey);
    return () => {
      container.removeEventListener("scroll", trackUserScroll);
      container.removeEventListener("wheel", trackWheel);
      container.removeEventListener("touchstart", startTouch);
      container.removeEventListener("touchend", stopTouch);
      container.removeEventListener("touchcancel", stopTouch);
      container.removeEventListener("pointerdown", startPointer);
      window.removeEventListener("pointerup", stopPointer);
      window.removeEventListener("pointercancel", stopPointer);
      container.removeEventListener("keydown", trackKey);
    };
  }, []);

  useEffect(() => {
    const container = scrollRef.current;
    if (container && autoScrollEnabled.current) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: reducedMotion ? "auto" : "smooth",
      });
    }
  }, [goal, task, loading, pollingError, reducedMotion]);

  return (
    <div
      ref={scrollRef}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-6 pt-6 sm:px-6 sm:pt-8 lg:px-10 chat-scrollbar"
    >
      <div className="mx-auto flex w-full max-w-[720px] flex-col gap-[22px]">
        {goal && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.7, ease: EASE }}
            className="max-w-[520px] self-end whitespace-pre-wrap rounded-2xl bg-[#3a3a37] px-4 py-3 text-[15px] text-[#eee] max-sm:max-w-[85%]"
          >
            {goal}
          </motion.div>
        )}

        {(steps.length > 0 || running) && (
          <motion.div
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.6, ease: EASE }}
            className="flex flex-col gap-2.5 rounded-xl bg-[#2f2f2d] px-4 py-[14px]"
          >
            {steps.length ? (
              steps.map((step, index) => (
                <motion.div
                  key={step.id}
                  initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: reducedMotion ? 0.01 : 0.5,
                    delay: reducedMotion ? 0 : index * 0.1,
                    ease: EASE,
                  }}
                  className="flex items-center gap-2.5 text-[13px] text-[#a8a8a2]"
                >
                  <StepStatus step={step} />
                  <span className="font-medium text-[#eee]">{step.agent}</span>
                  <span>{step.message ?? step.status}</span>
                </motion.div>
              ))
            ) : (
              <div className="flex items-center gap-2.5 text-[13px] text-[#a8a8a2]">
                <span className="size-[15px] shrink-0 animate-spin rounded-full border-2 border-[#3a3a37] border-t-[#7db3ff]" />
                <span>{CHAT_COPY.working}</span>
              </div>
            )}
          </motion.div>
        )}

        {running && !pollingError && (
          <div className="flex items-start gap-3" aria-label={CHAT_COPY.waiting}>
            <div className="flex size-10 shrink-0 items-center justify-center sm:size-12">
              <ChatLogo state="thinking" size="fill" />
            </div>
            <div className="min-w-0 flex-1 pt-2 text-[13px] text-[#a8a8a2]">
              {CHAT_COPY.working}
            </div>
          </div>
        )}

        {responseBlocks.length > 0 && (
          <div className="flex flex-col gap-4">
            {responseBlocks.map((block, index) => (
              <div
                key={`${task?.id}-${block.label}`}
                className="flex items-start gap-3"
              >
                <div className="flex size-10 shrink-0 items-center justify-center sm:size-12">
                  <AnimatePresence>
                    {index === 0 && showResponseLogo && (
                      <motion.div
                        key="response-thinking-logo"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{
                          duration: reducedMotion
                            ? 0
                            : CHAT_MOTION.indicatorFade,
                          ease: "easeOut",
                        }}
                      >
                        <ChatLogo state="thinking" size="fill" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="mb-1 text-[12px] text-[#a8a8a2]">{block.label}</p>
                  <StreamedText
                    content={block.content}
                    animate={animateResponse}
                    runKey={task?.id ?? ""}
                    copyText={fullResponseText}
                    showCopy={index === responseBlocks.length - 1}
                    onSettled={markBlockSettled}
                    index={index}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {task?.status === "failed" && (
          <div className="rounded-xl bg-[#3b2f1a] px-4 py-[14px] text-sm text-[#f0b44c]">
            <p>{task.error_message ?? CHAT_COPY.failed}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-3 rounded-[10px] border border-[#5a4824] px-3.5 py-2 text-[#f0b44c] transition-colors hover:bg-[#46391f] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
            >
              {CHAT_COPY.tryAgain}
            </button>
          </div>
        )}

        {pollingError && (
          <p role="alert" className="text-sm text-[#f0b44c]">
            {pollingError}
          </p>
        )}
      </div>
    </div>
  );
}
