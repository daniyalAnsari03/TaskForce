import type { ReactNode } from "react";

export default function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto w-full max-w-[960px] rounded-xl border-[0.5px] border-border bg-bg p-[14px] ${className}`}
    >
      {children}
    </div>
  );
}
