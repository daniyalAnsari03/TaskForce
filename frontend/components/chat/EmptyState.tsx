"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CHAT_COPY, EASE } from "./constants";

export default function EmptyState() {
  const reducedMotion = useReducedMotion();
  const itemTransition = (delay: number) => ({
    duration: reducedMotion ? 0.01 : 0.9,
    delay: reducedMotion ? 0 : delay,
    ease: EASE,
  });
  const initial = reducedMotion
    ? { opacity: 0 }
    : { opacity: 0, y: 24, filter: "blur(6px)" };
  const animate = reducedMotion
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };

  return (
    <motion.div
      exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -16 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.5, ease: EASE }}
      className="flex flex-col items-center text-center"
    >
      <motion.span
        initial={initial}
        animate={animate}
        transition={itemTransition(0)}
        className="rounded-lg bg-[#1e3a5f] px-2.5 py-1 text-xs text-[#7db3ff]"
      >
        {CHAT_COPY.multiAgent}
      </motion.span>
      <motion.h1
        initial={initial}
        animate={animate}
        transition={itemTransition(0.14)}
        className="mt-4 text-[28px] font-semibold leading-tight text-white md:text-4xl"
      >
        {CHAT_COPY.heading}
      </motion.h1>
      <motion.p
        initial={initial}
        animate={animate}
        transition={itemTransition(0.28)}
        className="mt-2 max-w-[600px] text-[15px] leading-relaxed text-[#a8a8a2]"
      >
        {CHAT_COPY.subtitle}
      </motion.p>
    </motion.div>
  );
}
