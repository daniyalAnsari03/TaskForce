"use client";

import Link from "next/link";
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
} from "framer-motion";
import { CheckCheck, Menu, X } from "lucide-react";
import { useState } from "react";
import { useHomeMotion } from "@/components/home/HomeMotion";

function Logo() {
  return (
    <Link
      href="/"
      aria-label="TaskForce home"
      className="inline-flex items-center gap-[10px]"
    >
      <span
        className="flex size-[26px] shrink-0 items-center justify-center rounded-[8px] bg-[#3b82f6] text-white"
      >
        <CheckCheck size={15} strokeWidth={2.2} aria-hidden="true" />
      </span>
      <span className="text-[18px] font-semibold tracking-[-0.01em] text-white">
        TaskForce
      </span>
    </Link>
  );
}

export { Logo };

export default function HomeNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { reducedMotion, scrollToSection } = useHomeMotion();
  const { scrollY, scrollYProgress } = useScroll();

  useMotionValueEvent(scrollY, "change", (value) => {
    const nextScrolled = value > 10;
    setScrolled((current) =>
      current === nextScrolled ? current : nextScrolled,
    );
  });

  const sectionLink = (id: string, label: string, mobile = false) => (
    <a
      key={id}
      href={`#${id}`}
      onClick={(event) => {
        event.preventDefault();
        scrollToSection(id);
        if (mobile) setMenuOpen(false);
      }}
      className="text-sm text-[#c9c9c4] no-underline transition-colors duration-400 hover:text-white"
    >
      {label}
    </a>
  );

  const newTaskLink = (mobile = false) => (
    <Link
      href="/new"
      onClick={() => mobile && setMenuOpen(false)}
      className="inline-flex min-h-11 items-center justify-center rounded-[10px] bg-[#3a3a37] px-4 py-[10px] text-sm font-medium text-white transition-colors duration-400 hover:bg-[#454542]"
    >
      New task
    </Link>
  );

  return (
    <>
      <motion.div
        className="fixed inset-x-0 top-0 z-[60] h-[2px] origin-left bg-[#3b82f6]"
        style={reducedMotion ? { scaleX: 0 } : { scaleX: scrollYProgress }}
        aria-hidden="true"
      />
      <motion.nav
        aria-label="Main navigation"
        initial={reducedMotion ? false : { opacity: 0, y: -20 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={`sticky top-0 z-50 border-b border-[#3a3a37] transition-[background-color,backdrop-filter] duration-500 ${scrolled ? "bg-[#262624]/90 backdrop-blur-md" : "bg-[#262624]"}`}
      >
        <div className="mx-auto flex h-[68px] w-full max-w-[1160px] items-center justify-between px-5 sm:px-6">
          <Logo />
          <div className="hidden items-center gap-8 md:flex">
            {sectionLink("agents", "Agents")}
            {sectionLink("how-it-works", "How it works")}
            {sectionLink("tools", "Tools")}
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden md:block">{newTaskLink()}</div>
            <button
              type="button"
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((open) => !open)}
              className="flex size-11 items-center justify-center rounded-[10px] text-white transition-colors hover:bg-[#3a3a37] md:hidden"
            >
              {menuOpen ? (
                <X size={21} strokeWidth={1.7} aria-hidden="true" />
              ) : (
                <Menu size={21} strokeWidth={1.7} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
        <AnimatePresence initial={false}>
          {menuOpen && (
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{
                duration: reducedMotion ? 0 : 0.5,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="overflow-hidden md:hidden"
            >
              <div className="mx-5 mb-4 flex flex-col gap-4 rounded-2xl border border-[#3a3a37] bg-[#2f2f2d] p-3 sm:mx-6">
                {sectionLink("agents", "Agents", true)}
                {sectionLink("how-it-works", "How it works", true)}
                {sectionLink("tools", "Tools", true)}
                {newTaskLink(true)}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}
