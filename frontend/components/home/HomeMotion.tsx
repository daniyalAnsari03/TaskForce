"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { motion, type Variants } from "framer-motion";

type HomeMotionContextValue = {
  reducedMotion: boolean;
  mobile: boolean;
  scrollToSection: (id: string) => void;
};

const HomeMotionContext = createContext<HomeMotionContextValue>({
  reducedMotion: true,
  mobile: true,
  scrollToSection: () => undefined,
});

const staggerContainerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.14, delayChildren: 0.1 },
  },
};

function staggerItemVariants(mobile: boolean): Variants {
  return {
    hidden: {
      opacity: 0,
      y: mobile ? 24 : 40,
      filter: `blur(${mobile ? 4 : 8}px)`,
    },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 1.1, ease: [0.22, 1, 0.36, 1] },
    },
  };
}

export function useHomeMotion() {
  return useContext(HomeMotionContext);
}

export function SmoothScroll({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(true);
  const [mobile, setMobile] = useState(true);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const updatePreferences = () => {
      setReducedMotion(motionPreference.matches);
      setMobile(window.innerWidth < 640);
    };

    updatePreferences();
    motionPreference.addEventListener("change", updatePreferences);
    window.addEventListener("resize", updatePreferences);

    return () => {
      motionPreference.removeEventListener("change", updatePreferences);
      window.removeEventListener("resize", updatePreferences);
    };
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (time) => Math.min(1, 1.001 - Math.pow(2, -10 * time)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    let frameId = 0;
    const frame = (time: number) => {
      lenis.raf(time);
      frameId = window.requestAnimationFrame(frame);
    };
    frameId = window.requestAnimationFrame(frame);

    return () => {
      window.cancelAnimationFrame(frameId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, [reducedMotion]);

  const scrollToSection = useCallback((id: string) => {
    const target = document.getElementById(id);
    if (!target) return;

    const lenis = lenisRef.current;
    if (lenis) {
      lenis.scrollTo(target, { offset: -80 });
    } else {
      target.scrollIntoView({ behavior: "auto" });
    }
  }, []);

  return (
    <HomeMotionContext.Provider
      value={{ reducedMotion, mobile, scrollToSection }}
    >
      {children}
    </HomeMotionContext.Provider>
  );
}

export function Reveal({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const { reducedMotion, mobile } = useHomeMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: mobile ? 24 : 40, filter: `blur(${mobile ? 4 : 8}px)` }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: 1.1, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerReveal({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reducedMotion } = useHomeMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={staggerContainerVariants}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const { reducedMotion, mobile } = useHomeMotion();

  if (reducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div className={className} variants={staggerItemVariants(mobile)}>
      {children}
    </motion.div>
  );
}
