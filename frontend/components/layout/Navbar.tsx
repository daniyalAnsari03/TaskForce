"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const links = [
  { href: "/new", label: "New task" },
];

export default function Navbar({ rightSlot }: { rightSlot?: ReactNode }) {
  const pathname = usePathname();

  return (
    <nav className="mb-3 flex items-center justify-between border-b-[0.5px] border-border pb-[10px]">
      <Link href="/" className="text-sm font-medium text-text">
        TaskForce
      </Link>
      <div className="flex items-center gap-4">
        {links.map((link) => {
          const active = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`text-xs ${active ? "text-text" : "text-muted"}`}
            >
              {link.label}
            </Link>
          );
        })}
        {rightSlot}
      </div>
    </nav>
  );
}
