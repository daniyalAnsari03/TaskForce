import type { ReactNode } from "react";

export default function Card({
  children,
  variant = "default",
  className = "",
}: {
  children: ReactNode;
  variant?: "default" | "accent";
  className?: string;
}) {
  const background = variant === "accent" ? "bg-accentBg" : "bg-card";
  return <div className={`${background} rounded-lg p-2.5 ${className}`}>{children}</div>;
}
