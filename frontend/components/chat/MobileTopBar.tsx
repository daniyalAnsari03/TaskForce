"use client";

import { Menu, Plus } from "lucide-react";
import { CHAT_COPY } from "./constants";
import ChatLogo from "./ChatLogo";

type MobileTopBarProps = {
  onOpenMenu: () => void;
  onNewTask: () => void;
  pending: boolean;
};

export default function MobileTopBar({
  onOpenMenu,
  onNewTask,
  pending,
}: MobileTopBarProps) {
  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-[#3a3a37] bg-[#262624] px-4 lg:hidden">
      <button
        type="button"
        aria-label={CHAT_COPY.menu}
        onClick={onOpenMenu}
        className="flex size-11 items-center justify-center rounded-lg text-white hover:bg-[#2f2f2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
      >
        <Menu size={21} strokeWidth={1.7} aria-hidden="true" />
      </button>
      <div className="flex items-center gap-1.5">
        <span className="flex size-8 items-center justify-center">
          <ChatLogo state={pending ? "thinking" : "none"} size={28} />
        </span>
        <span className="text-base font-semibold text-white">{CHAT_COPY.brand}</span>
      </div>
      <button
        type="button"
        aria-label={CHAT_COPY.newTask}
        onClick={onNewTask}
        className="flex size-11 items-center justify-center rounded-lg text-white hover:bg-[#2f2f2d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
      >
        <Plus size={20} strokeWidth={1.7} aria-hidden="true" />
      </button>
    </header>
  );
}
