"use client";

import { IconLock } from "@tabler/icons-react";

type Props = {
  label: string;
  checked: boolean;
  onToggle: () => void;
};

export default function ToggleRow({ label, checked, onToggle }: Props) {
  return (
    <div className="flex items-center justify-between rounded-lg border-[0.5px] border-transparent bg-warningBg px-[12px] py-[9px]">
      <span className="flex items-center gap-[8px] text-[13px] text-warning">
        <IconLock size={16} stroke={1.5} />
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={onToggle}
        className={`rounded-lg border-[0.5px] border-transparent px-[8px] py-[3px] text-xs transition-opacity duration-150 hover:opacity-80 ${
          checked ? "text-warning" : "text-faint"
        }`}
      >
        {checked ? "On" : "Off"}
      </button>
    </div>
  );
}
