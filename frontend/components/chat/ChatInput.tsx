"use client";

import { ArrowUp, LoaderCircle } from "lucide-react";
import { useEffect, useRef } from "react";
import { CHAT_COPY, TOOL_OPTIONS, type ToolName } from "./constants";
import ToolsMenu from "./ToolsMenu";

type ChatInputProps = {
  goal: string;
  onGoalChange: (value: string) => void;
  tools: ToolName[];
  onToggleTool: (name: ToolName) => void;
  requireApproval: boolean;
  onToggleApproval: () => void;
  onSubmit: () => void;
  busy: boolean;
};

export default function ChatInput({
  goal,
  onGoalChange,
  tools,
  onToggleTool,
  requireApproval,
  onToggleApproval,
  onSubmit,
  busy,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    textarea.style.overflowY = textarea.scrollHeight > 200 ? "auto" : "hidden";
  }, [goal]);

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className="w-full"
    >
      <div className="w-full rounded-[18px] border border-[#454542] bg-[#2f2f2d] p-[14px] pb-3 pl-4 focus-within:ring-2 focus-within:ring-[#3b82f6] focus-within:ring-offset-2 focus-within:ring-offset-[#262624]">
        <textarea
          ref={textareaRef}
          value={goal}
          onChange={(event) => onGoalChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === "Enter" &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              onSubmit();
            }
          }}
          placeholder={CHAT_COPY.placeholder}
          rows={2}
          disabled={busy}
          className="block min-h-11 w-full resize-none border-0 bg-transparent p-0 text-[16px] text-[#eee] outline-none placeholder:text-[#8a8a85] disabled:opacity-70 sm:text-[15px]"
        />
        <div className="mt-1 flex items-center gap-2">
          <ToolsMenu
            tools={tools}
            onToggleTool={onToggleTool}
            requireApproval={requireApproval}
            onToggleApproval={onToggleApproval}
          />
          {TOOL_OPTIONS.filter((tool) => tools.includes(tool.name)).map(
            ({ name, icon: Icon }) => (
              <span
                key={name}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#1e3a5f] px-2.5 py-1 text-xs text-[#7db3ff]"
              >
                <Icon size={13} strokeWidth={1.7} aria-hidden="true" />
                <span className="max-sm:hidden">{name}</span>
              </span>
            ),
          )}
          <span className="flex-1" />
          <button
            type="submit"
            aria-label={CHAT_COPY.send}
            disabled={!goal.trim() || busy}
            className="chat-icon-hit rounded-full text-white transition-transform duration-300 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
          >
            <span className="chat-icon-visual flex items-center justify-center rounded-full bg-[#3b82f6] transition-colors duration-300 hover:bg-[#3478e5]">
              {busy ? (
                <LoaderCircle
                  size={17}
                  strokeWidth={2}
                  className="animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <ArrowUp size={18} strokeWidth={2} aria-hidden="true" />
              )}
            </span>
          </button>
        </div>
      </div>
    </form>
  );
}
