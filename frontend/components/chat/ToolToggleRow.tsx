"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type ToolToggleRowProps = {
  title: string;
  subtitle: string;
  icon: LucideIcon;
  checked: boolean;
  onToggle: () => void;
};

export default function ToolToggleRow({
  title,
  subtitle,
  icon: Icon,
  checked,
  onToggle,
}: ToolToggleRowProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onToggle}
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[#eee] transition-colors duration-300 hover:bg-[#3a3a37] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3b82f6]"
    >
      <Icon size={18} strokeWidth={1.7} aria-hidden="true" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm">{title}</span>
        <span className="mt-0.5 block text-xs text-[#8a8a85]">{subtitle}</span>
      </span>
      <span
        className={`relative h-5 w-[34px] shrink-0 rounded-full transition-colors duration-300 ${checked ? "bg-[#3b82f6]" : "bg-[#4a4a46]"}`}
        aria-hidden="true"
      >
        <motion.span
          className="absolute top-0.5 size-4 rounded-full bg-white"
          animate={{ left: checked ? 16 : 2 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        />
      </span>
    </button>
  );
}
