"use client";

import {
  AnimatePresence,
  motion,
  useReducedMotion,
} from "framer-motion";
import { Lock, Plus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CHAT_COPY, EASE, TOOL_OPTIONS, type ToolName } from "./constants";
import ToolToggleRow from "./ToolToggleRow";

type ToolsMenuProps = {
  tools: ToolName[];
  onToggleTool: (name: ToolName) => void;
  requireApproval: boolean;
  onToggleApproval: () => void;
};

export default function ToolsMenu({
  tools,
  onToggleTool,
  requireApproval,
  onToggleApproval,
}: ToolsMenuProps) {
  const [open, setOpen] = useState(false);
  const [openDown, setOpenDown] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const wasOpen = useRef(false);

  useEffect(() => {
    if (!open) return;

    const updatePosition = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setOpenDown(rect.top < 360);
    };
    const handlePointer = (event: PointerEvent) => {
      if (
        !menuRef.current?.contains(event.target as Node) &&
        !triggerRef.current?.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    updatePosition();
    document.addEventListener("pointerdown", handlePointer);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("resize", updatePosition);
    return () => {
      document.removeEventListener("pointerdown", handlePointer);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", updatePosition);
    };
  }, [open]);

  useEffect(() => {
    if (wasOpen.current && !open) triggerRef.current?.focus();
    wasOpen.current = open;
  }, [open]);

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-label={CHAT_COPY.addTools}
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="chat-icon-hit rounded-full text-[#eee] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
      >
        <span className="chat-icon-visual flex items-center justify-center rounded-full border border-[#454542] bg-transparent transition-colors duration-300 hover:bg-[#3a3a37]">
          <Plus size={18} strokeWidth={1.7} aria-hidden="true" />
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            ref={menuRef}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 8, scale: 0.96 }}
            transition={{
              duration: reducedMotion ? 0.01 : 0.35,
              ease: EASE,
            }}
            className={`absolute left-0 z-40 w-[320px] max-w-[calc(100vw-32px)] rounded-[14px] border border-[#454542] bg-[#2f2f2d] p-2 shadow-[0_8px_30px_rgba(0,0,0,0.53)] ${openDown ? "top-[calc(100%+10px)]" : "bottom-[calc(100%+10px)]"}`}
          >
            {TOOL_OPTIONS.map((tool) => (
              <ToolToggleRow
                key={tool.name}
                title={tool.name}
                subtitle={tool.description}
                icon={tool.icon}
                checked={tools.includes(tool.name)}
                onToggle={() => onToggleTool(tool.name)}
              />
            ))}
            <div className="my-1.5 mx-1 h-px bg-[#454542]" />
            <button
              type="button"
              role="switch"
              aria-checked={requireApproval}
              onClick={onToggleApproval}
              className="flex w-full items-center gap-3 rounded-lg bg-[#3b2f1a] px-3 py-2.5 text-left text-sm text-[#f0b44c] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
            >
              <Lock size={18} strokeWidth={1.7} aria-hidden="true" />
              <span className="flex-1">{CHAT_COPY.approval}</span>
              <span className="text-[13px] font-bold">
                {requireApproval ? CHAT_COPY.approvalOn : CHAT_COPY.approvalOff}
              </span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
