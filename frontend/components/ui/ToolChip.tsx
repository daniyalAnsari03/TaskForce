"use client";

import type { ReactNode } from "react";

type Props = {
  label: string;
  icon?: ReactNode;
  selected: boolean;
  onSelect: () => void;
};

export default function ToolChip({ label, icon, selected, onSelect }: Props) {
  const tone = selected
    ? "text-accent bg-accentBg border-transparent hover:bg-accentBg"
    : "text-muted bg-card border-border hover:text-text";

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`inline-flex items-center gap-[6px] rounded-lg border-[0.5px] px-[10px] py-[7px] text-xs transition-[background-color,color] duration-150 ${tone}`}
    >
      {icon}
      {label}
    </button>
  );
}
