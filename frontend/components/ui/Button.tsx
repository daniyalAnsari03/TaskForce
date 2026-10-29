"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

type Props = {
  children: ReactNode;
  href?: string;
  size?: "sm" | "md";
  variant?: "default" | "full";
  disabled?: boolean;
  className?: string;
  onClick?: ComponentPropsWithoutRef<"button">["onClick"];
};

export default function Button({
  children,
  href,
  size = "md",
  variant = "default",
  disabled = false,
  className = "",
  onClick,
}: Props) {
  const classes = [
    "inline-flex items-center justify-center rounded-lg border-[0.5px] border-borderStrong bg-transparent text-text",
    "transition-[background-color,transform,opacity] duration-150",
    disabled ? "" : "hover:bg-white/5 active:scale-[0.98]",
    size === "sm" ? "text-xs" : "text-[13px]",
    "px-[14px] py-[7px]",
    variant === "full" ? "w-full" : "",
    disabled ? "opacity-50 pointer-events-none" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href && !disabled) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" className={classes} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  );
}
