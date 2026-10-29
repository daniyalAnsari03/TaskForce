"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import type { TaskListItem } from "@/lib/types";
import { CHAT_COPY, TOOL_OPTIONS, type ToolName } from "./constants";
import ChatLogo from "./ChatLogo";

type SidebarProps = {
  tasks: TaskListItem[];
  loading: boolean;
  error: string | null;
  activeId: string | null;
  tools: ToolName[];
  onToggleTool: (name: ToolName) => void;
  onNewTask: () => void;
  onSelectTask: (task: TaskListItem) => void;
  pending: boolean;
};

export default function Sidebar({
  tasks,
  loading,
  error,
  activeId,
  tools,
  onToggleTool,
  onNewTask,
  onSelectTask,
  pending,
}: SidebarProps) {
  return (
    <aside className="flex h-full w-full shrink-0 flex-col gap-[6px] border-r border-[#3a3a37] bg-[#1f1f1e] px-3 py-4">
      <Link
        href="/"
        className="flex items-center gap-2 px-3 pb-[14px] pt-1 text-[17px] font-semibold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
      >
        <span className="flex size-8 items-center justify-center">
          <ChatLogo state={pending ? "thinking" : "none"} size={28} />
        </span>
        {CHAT_COPY.brand}
      </Link>
      <nav
        aria-label={CHAT_COPY.navigation}
        className="flex min-h-0 flex-1 flex-col gap-[6px]"
      >
        <button
          type="button"
          onClick={onNewTask}
          className="flex min-h-11 w-full items-center gap-2.5 rounded-lg bg-[#2f2f2d] px-3 py-[9px] text-left text-sm text-white transition-colors duration-300 hover:bg-[#3a3a37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
        >
          <Plus size={16} strokeWidth={1.7} aria-hidden="true" />
          {CHAT_COPY.newTask}
        </button>
        <p className="px-3 pb-1 pt-[14px] text-[11px] tracking-[0.06em] text-[#8a8a85]">
          {CHAT_COPY.toolsLabel}
        </p>
        {TOOL_OPTIONS.map(({ name, icon: Icon }) => {
          const active = tools.includes(name);
          return (
            <button
              key={name}
              type="button"
              aria-pressed={active}
              onClick={() => onToggleTool(name)}
              className={`flex min-h-11 w-full items-center gap-2.5 rounded-lg px-3 py-[9px] text-left text-sm transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6] ${active ? "bg-[#1e3a5f] text-[#7db3ff]" : "text-[#c9c9c4] hover:bg-[#2f2f2d]"}`}
            >
              <Icon size={16} strokeWidth={1.7} aria-hidden="true" />
              {name}
            </button>
          );
        })}
        <p className="px-3 pb-1 pt-[14px] text-[11px] tracking-[0.06em] text-[#8a8a85]">
          {CHAT_COPY.historyLabel}
        </p>
        <div className="min-h-0 flex-1 overflow-y-auto chat-scrollbar">
          {loading ? (
            <div className="flex flex-col gap-2 px-1">
              {[0, 1, 2].map((row) => (
                <div
                  key={row}
                  className="h-8 animate-[pulse_2.4s_ease-in-out_infinite] rounded-lg bg-[#2f2f2d]"
                />
              ))}
            </div>
          ) : error ? (
            <p role="alert" className="px-3 py-2 text-[13px] text-[#f0b44c]">
              {error}
            </p>
          ) : tasks.length ? (
            <div className="flex flex-col gap-1">
              {tasks.map((task) => (
                <button
                  key={task.id}
                  type="button"
                  title={task.goal}
                  onClick={() => onSelectTask(task)}
                  className={`w-full truncate rounded-lg px-3 py-2 text-left text-[13px] transition-colors duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6] ${activeId === task.id ? "bg-[#2f2f2d] text-[#eee]" : "text-[#a8a8a2] hover:bg-[#2f2f2d] hover:text-[#eee]"}`}
                >
                  {task.goal}
                </button>
              ))}
            </div>
          ) : (
            <p className="px-3 py-2 text-[13px] text-[#8a8a85]">
              {CHAT_COPY.noTasks}
            </p>
          )}
        </div>
      </nav>
    </aside>
  );
}
