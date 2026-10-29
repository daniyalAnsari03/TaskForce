"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowUp,
  Check,
  CheckCheck,
  Code,
  FileText,
  Lock,
  Mail,
  Plus,
  Search,
} from "lucide-react";
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import HomeNav, { Logo } from "@/components/home/HomeNav";
import {
  Reveal,
  SmoothScroll,
  StaggerItem,
  StaggerReveal,
  useHomeMotion,
} from "@/components/home/HomeMotion";

const ease = [0.22, 1, 0.36, 1] as const;

const agents = [
  {
    index: "01",
    title: "Researcher",
    description: "Searches the web and collects facts with source links.",
    icon: Search,
  },
  {
    index: "02",
    title: "Coder",
    description: "Writes and runs code to produce real results.",
    icon: Code,
  },
  {
    index: "03",
    title: "Writer",
    description: "Turns findings into clear reports and files.",
    icon: FileText,
  },
  {
    index: "04",
    title: "Reviewer",
    description: "Checks every result before it reaches you.",
    icon: CheckCheck,
  },
] as const;

const workflowSteps = [
  {
    number: "01",
    title: "Describe your goal",
    description:
      "Type what you want done in the chat box and pick the tools the agents may use.",
  },
  {
    number: "02",
    title: "Watch agents work",
    description:
      "Follow every step live as the Researcher, Coder, Writer and Reviewer collaborate.",
  },
  {
    number: "03",
    title: "Review and receive",
    description:
      "Get a finished summary or file, with sources, in the same conversation.",
  },
] as const;

const tools = [
  {
    title: "Web search",
    description:
      "Pull in current information from the web, always with source links.",
    icon: Search,
    span: "lg:col-span-2",
  },
  {
    title: "Files",
    description: "Receive real files, not just text in a chat window.",
    icon: FileText,
    span: "lg:col-span-1",
  },
  {
    title: "Code",
    description: "Agents write and run code to get you real output.",
    icon: Code,
    span: "lg:col-span-1",
  },
  {
    title: "Email",
    description: "Send results to anyone, once you approve it.",
    icon: Mail,
    span: "lg:col-span-2",
  },
] as const;

const previewTools = [
  { title: "Web search", icon: Search, active: true },
  { title: "Files", icon: FileText, active: true },
  { title: "Code", icon: Code, active: false },
  { title: "Email", icon: Mail, active: true },
] as const;

const taskRows = [
  { name: "Researcher", task: "Searching the web" },
  { name: "Writer", task: "Drafting the summary" },
  { name: "Reviewer", task: "Checks complete" },
] as const;

const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "New task", href: "/new" },
      { label: "Watch demo", href: "#" },
    ],
  },
  {
    title: "Agents",
    links: [
      { label: "Researcher", href: "#agents" },
      { label: "Coder", href: "#agents" },
      { label: "Writer", href: "#agents" },
      { label: "Reviewer", href: "#agents" },
    ],
  },
  {
    title: "Tools",
    links: [
      { label: "Web search", href: "#tools" },
      { label: "Files", href: "#tools" },
      { label: "Code", href: "#tools" },
      { label: "Email", href: "#tools" },
    ],
  },
] as const;

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <div className="mb-11 flex max-w-[620px] flex-col gap-[14px]">
      <Reveal>
        <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#7db3ff]">
          {eyebrow}
        </p>
      </Reveal>
      <Reveal delay={0.14}>
        <h2 className="text-[30px] font-semibold leading-[1.12] tracking-[-0.025em] text-white md:text-[36px] lg:text-[40px]">
          {title}
        </h2>
      </Reveal>
      <Reveal delay={0.28}>
        <p className="text-[17px] leading-[1.6] text-[#a8a8a2]">
          {description}
        </p>
      </Reveal>
    </div>
  );
}

function PrimaryButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/new"
      className={`group inline-flex min-h-[52px] items-center justify-center gap-[10px] rounded-xl bg-[#3b82f6] px-[22px] py-[14px] text-[15px] font-medium text-white shadow-[0_6px_24px_rgba(59,130,246,0.30)] transition-colors duration-400 hover:bg-[#4b8df7] ${className}`}
    >
      Start a task
      <ArrowRight
        size={16}
        strokeWidth={2}
        aria-hidden="true"
        className="transition-transform duration-400 group-hover:translate-x-1"
      />
    </Link>
  );
}

function Hero() {
  const { reducedMotion } = useHomeMotion();

  return (
    <section className="mx-auto flex w-full max-w-[1160px] flex-col items-center gap-[26px] px-5 pt-16 text-center sm:px-6 sm:pt-24">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 18 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: reducedMotion ? 0 : 0.3, ease }}
        className="rounded-full bg-[#1e3a5f] px-[14px] py-[7px] text-[13px] font-medium text-[#7db3ff]"
      >
        Multi-agent system
      </motion.div>
      <h1 className="max-w-[860px] text-[40px] font-semibold leading-[1.05] tracking-[-0.035em] text-white sm:text-[52px] lg:text-[68px]">
        <span className="block overflow-hidden">
          <motion.span
            className="block"
            initial={reducedMotion ? false : { y: "100%" }}
            animate={reducedMotion ? undefined : { y: 0 }}
            transition={{ duration: 1.2, delay: reducedMotion ? 0 : 0.5, ease }}
          >
            Set the goal.
          </motion.span>
        </span>
        <span className="block overflow-hidden">
          <motion.span
            className="block"
            initial={reducedMotion ? false : { y: "100%" }}
            animate={reducedMotion ? undefined : { y: 0 }}
            transition={{
              duration: 1.2,
              delay: reducedMotion ? 0 : 0.65,
              ease,
            }}
          >
            Your agents do the work.
          </motion.span>
        </span>
      </h1>
      <motion.p
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: reducedMotion ? 0 : 0.9, ease }}
        className="max-w-[620px] text-[17px] leading-[1.6] text-[#a8a8a2] sm:text-[19px]"
      >
        Research, code, reports and email, handled by a team of AI agents. Watch
        every step live and approve before anything is sent.
      </motion.p>
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 16 }}
        animate={reducedMotion ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: reducedMotion ? 0 : 1.1, ease }}
        className="mt-1 flex w-full max-w-[360px] flex-col justify-center gap-3 sm:max-w-none sm:flex-row"
      >
        <PrimaryButton className="w-full sm:w-auto" />
        <button
          type="button"
          className="inline-flex min-h-[52px] items-center justify-center rounded-xl border border-[#5a5a56] bg-transparent px-[22px] py-[14px] text-[15px] font-medium text-white transition-colors duration-400 hover:border-[#8a8a85]"
        >
          Watch demo
        </button>
      </motion.div>
    </section>
  );
}

function PreviewChat() {
  const { reducedMotion } = useHomeMotion();
  const frameRef = useRef<HTMLDivElement>(null);
  const frameInView = useInView(frameRef, { once: true, amount: 0.25 });
  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "end start"],
  });
  const parallaxY = useTransform(scrollYProgress, [0, 1], [20, -20]);

  return (
    <div className="mx-auto w-full max-w-[1160px] px-5 pt-12 sm:px-6 sm:pt-[72px]">
      <motion.div
        ref={frameRef}
        initial={reducedMotion ? false : { opacity: 0, y: 80, scale: 0.96 }}
        whileInView={
          reducedMotion ? undefined : { opacity: 1, y: 0, scale: 1 }
        }
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: 1.4, ease }}
        className="w-full"
      >
        <motion.div
          style={reducedMotion ? undefined : { y: parallaxY }}
        className="flex h-auto min-h-[360px] overflow-hidden rounded-[20px] border border-[#454542] bg-[#1f1f1e] shadow-[0_30px_80px_rgba(0,0,0,0.6)] md:h-[420px]"
      >
        <aside className="hidden w-[200px] shrink-0 flex-col gap-1 border-r border-[#3a3a37] p-[14px_10px] md:flex">
          <div className="px-[10px] pb-3 pt-[2px] text-sm font-semibold text-white">
            TaskForce
          </div>
          <div className="flex items-center gap-2 rounded-[7px] bg-[#2f2f2d] px-[10px] py-[7px] text-xs text-white">
            <Plus size={13} strokeWidth={1.7} aria-hidden="true" />
            New task
          </div>
          <div className="px-[10px] pb-[3px] pt-3 text-[10px] tracking-[0.08em] text-[#9a9a95]">
            TOOLS
          </div>
          {previewTools.map(({ title, icon: Icon, active }) => (
            <div
              key={title}
              className={`flex items-center gap-2 rounded-[7px] px-[10px] py-[7px] text-xs ${active ? "bg-[#1e3a5f] text-[#7db3ff]" : "text-[#c9c9c4]"}`}
            >
              <Icon size={13} strokeWidth={1.7} aria-hidden="true" />
              {title}
            </div>
          ))}
          <div className="px-[10px] pb-[3px] pt-3 text-[10px] tracking-[0.08em] text-[#9a9a95]">
            HISTORY
          </div>
          <div className="rounded-[7px] bg-[#2f2f2d] px-[10px] py-[6px] text-xs text-[#eee]">
            3 key facts about Claude AI
          </div>
        </aside>
        <div className="flex min-w-0 flex-1 flex-col justify-between bg-[#262624] p-5 md:px-10 md:pb-[18px] md:pt-[26px]">
          <div className="flex flex-col gap-4">
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={
                reducedMotion || !frameInView
                  ? undefined
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.9, delay: 0.15, ease }}
              className="ml-auto max-w-[85%] rounded-[14px] bg-[#3a3a37] px-[14px] py-[10px] text-[13px] text-[#eee]"
            >
              Find 3 key facts about Claude AI, with a source link for each.
            </motion.div>
            <motion.div
              initial={reducedMotion ? false : { opacity: 0, y: 12 }}
              animate={
                reducedMotion || !frameInView
                  ? undefined
                  : { opacity: 1, y: 0 }
              }
              transition={{ duration: 0.9, delay: 0.5, ease }}
              className="flex flex-col gap-2 rounded-[10px] bg-[#2f2f2d] px-[14px] py-3"
            >
              {taskRows.map((row, index) => (
                <motion.div
                  key={row.name}
                  initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                  animate={
                    reducedMotion || !frameInView
                      ? undefined
                      : { opacity: 1, y: 0 }
                  }
                  transition={{
                    duration: 0.9,
                    delay: reducedMotion ? 0 : 0.8 + index * 0.5,
                    ease,
                  }}
                  className="flex flex-wrap items-center gap-2 text-xs text-[#a8a8a2]"
                >
                  <motion.span
                    initial={reducedMotion ? false : { scale: 0 }}
                    animate={
                      reducedMotion || !frameInView ? undefined : { scale: 1 }
                    }
                    transition={{
                      duration: 0.9,
                      delay: reducedMotion ? 0 : 0.8 + index * 0.5,
                      ease,
                    }}
                    className="inline-flex"
                  >
                    <Check
                      size={13}
                      strokeWidth={2}
                      color="#4ade80"
                      aria-hidden="true"
                    />
                  </motion.span>
                  <span className="font-medium text-[#eee]">{row.name}</span>
                  <span>{row.task}</span>
                </motion.div>
              ))}
            </motion.div>
            <div className="flex flex-col gap-1 text-[13px] leading-[1.6] text-[#d8d8d3]">
              <motion.p
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={
                  reducedMotion || !frameInView
                    ? undefined
                    : { opacity: 1, y: 0 }
                }
                transition={{ duration: 0.9, delay: 2.4, ease }}
              >
                1. Claude is Anthropic&apos;s AI assistant for Q&amp;A, writing and
                coding.
              </motion.p>
              <motion.p
                initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                animate={
                  reducedMotion || !frameInView
                    ? undefined
                    : { opacity: 1, y: 0 }
                }
                transition={{ duration: 0.9, delay: 2.6, ease }}
              >
                2. It is built to be helpful, honest and harmless.
              </motion.p>
            </div>
          </div>
          <div className="mt-5 flex min-h-12 items-center gap-2 rounded-[14px] border border-[#454542] bg-[#2f2f2d] px-3 py-[10px]">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full border border-[#454542] text-white">
              <Plus size={15} strokeWidth={1.7} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1 text-[13px] text-[#9a9a95]">
              Write your goal...
            </span>
            <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[#3b82f6] text-white">
              <ArrowUp size={15} strokeWidth={2} aria-hidden="true" />
            </span>
          </div>
        </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

function AgentsSection() {
  return (
    <section
      id="agents"
      className="mx-auto w-full max-w-[1160px] px-5 pt-20 sm:px-6 md:pt-[104px] lg:pt-32"
    >
      <SectionHeader
        eyebrow="Agents"
        title="A full team, working in sync."
        description="A manager splits your goal across four specialists, so each part of the job is done by the right agent."
      />
      <StaggerReveal className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {agents.map(({ index, title, description, icon: Icon }) => (
          <StaggerItem key={title}>
            <article className="group flex h-full flex-col gap-[10px] rounded-2xl border border-[#3a3a37] bg-[#2f2f2d] p-6 transition-[transform,border-color] duration-500 md:hover:-translate-y-1 md:hover:border-[#454542]">
              <div className="flex items-center justify-between">
                <span className="rounded-[10px] bg-[#1e3a5f] p-[10px] text-[#7db3ff] transition-colors duration-500 group-hover:bg-[#25476f]">
                  <Icon size={20} strokeWidth={1.7} aria-hidden="true" />
                </span>
                <span className="text-[13px] text-[#9a9a95]">{index}</span>
              </div>
              <h3 className="mt-[14px] text-[19px] font-semibold tracking-[-0.01em] text-white">
                {title}
              </h3>
              <p className="text-[15px] leading-[1.55] text-[#a8a8a2]">
                {description}
              </p>
            </article>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </section>
  );
}

function WorkflowStep({
  number,
  title,
  description,
  index,
}: (typeof workflowSteps)[number] & { index: number }) {
  const { reducedMotion } = useHomeMotion();
  const stepRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stepRef, { once: true, amount: 0.25 });
  const delay = index * 0.2;

  return (
    <div ref={stepRef} className="relative flex flex-col gap-[10px] pt-[24px]">
      <motion.div
        initial={reducedMotion ? false : { scaleX: 0 }}
        animate={
          reducedMotion || !inView ? undefined : { scaleX: 1 }
        }
        transition={{ duration: 1.4, delay, ease }}
        className="absolute inset-x-0 top-0 h-[2px] origin-left bg-[#3b82f6]"
        aria-hidden="true"
      />
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, y: 12 }}
        animate={
          reducedMotion || !inView ? undefined : { opacity: 1, y: 0 }
        }
        transition={{ duration: 0.9, delay: reducedMotion ? 0 : delay + 0.4, ease }}
      >
        <p className="text-sm font-medium text-[#7db3ff]">{number}</p>
        <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.015em] text-white">
          {title}
        </h3>
        <p className="mt-[10px] text-[15px] leading-[1.6] text-[#a8a8a2]">
          {description}
        </p>
      </motion.div>
    </div>
  );
}

function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="mx-auto w-full max-w-[1160px] px-5 pt-20 sm:px-6 md:pt-[104px] lg:pt-32"
    >
      <SectionHeader
        eyebrow="How it works"
        title="From goal to result in three steps."
        description="No setup and no prompts to engineer. Describe what you need in plain language."
      />
      <div className="grid grid-cols-1 gap-7 md:grid-cols-3">
        {workflowSteps.map((step, index) => (
          <WorkflowStep key={step.number} {...step} index={index} />
        ))}
      </div>
    </section>
  );
}

function ToolsSection() {
  return (
    <section
      id="tools"
      className="mx-auto w-full max-w-[1160px] px-5 pt-20 sm:px-6 md:pt-[104px] lg:pt-32"
    >
      <SectionHeader
        eyebrow="Tools"
        title="Everything your agents need."
        description="Turn tools on or off from the plus button in the chat box, per task."
      />
      <StaggerReveal className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {tools.map(({ title, description, icon: Icon, span }) => (
          <StaggerItem key={title} className={span}>
            <article className="group flex h-full flex-col gap-[10px] rounded-2xl border border-[#3a3a37] bg-[#2f2f2d] p-[26px] transition-[transform,border-color] duration-500 md:hover:-translate-y-1 md:hover:border-[#454542]">
              <Icon
                size={24}
                strokeWidth={1.7}
                color="#7db3ff"
                aria-hidden="true"
                className="transition-colors duration-500 group-hover:text-[#a0c9ff]"
              />
              <h3 className="mt-3 text-[19px] font-semibold text-white">
                {title}
              </h3>
              <p className="text-[15px] leading-[1.55] text-[#a8a8a2]">
                {description}
              </p>
            </article>
          </StaggerItem>
        ))}
      </StaggerReveal>
    </section>
  );
}

function ControlSection() {
  const { reducedMotion } = useHomeMotion();

  return (
    <section className="mx-auto w-full max-w-[1160px] px-5 pt-20 sm:px-6 md:pt-[104px] lg:pt-32">
      <Reveal>
        <div className="flex flex-col items-center gap-8 rounded-[24px] border border-[#3a3a37] bg-[#2f2f2d] p-6 md:p-10 lg:flex-row lg:gap-14 lg:p-14">
          <div className="flex flex-1 flex-col gap-[14px]">
            <p className="text-[13px] font-medium uppercase tracking-[0.12em] text-[#7db3ff]">
              Control
            </p>
            <h2 className="text-[28px] font-semibold leading-[1.15] tracking-[-0.025em] text-white lg:text-[36px]">
              Nothing is sent without your approval.
            </h2>
            <p className="text-[17px] leading-[1.6] text-[#a8a8a2]">
              Agents can draft and prepare emails, but they always stop and ask
              you first. You decide what goes out.
            </p>
          </div>
          <motion.div
            initial={reducedMotion ? false : { opacity: 0, x: 40 }}
            whileInView={
              reducedMotion ? undefined : { opacity: 1, x: 0 }
            }
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 1.1, delay: reducedMotion ? 0 : 0.2, ease }}
            className="flex w-full flex-1 flex-col gap-4 rounded-2xl bg-[#3b2f1a] p-[22px]"
          >
            <div className="flex items-center gap-3 text-base font-medium text-[#f0b44c]">
              <motion.span
                initial={reducedMotion ? false : { opacity: 0 }}
                whileInView={reducedMotion ? undefined : { opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, delay: reducedMotion ? 0 : 0.8, ease }}
                className="inline-flex"
              >
                <Lock size={20} strokeWidth={1.7} aria-hidden="true" />
              </motion.span>
              <span className="flex-1">
                Ask for my approval before sending email
              </span>
              <span className="text-sm font-bold">On</span>
            </div>
            <div className="h-px bg-[#5a4824]" />
            <p className="text-sm leading-[1.6] text-[#e3c58a]">
              Email draft ready. Review it, then approve or reject.
            </p>
          </motion.div>
        </div>
      </Reveal>
    </section>
  );
}

function CtaSection() {
  const { reducedMotion } = useHomeMotion();

  return (
    <section className="mx-auto w-full max-w-[1160px] px-5 pt-20 sm:px-6 md:pt-[104px] lg:pt-32">
      <motion.div
        initial={reducedMotion ? false : { opacity: 0, scale: 0.97 }}
        whileInView={
          reducedMotion ? undefined : { opacity: 1, scale: 1 }
        }
        viewport={{ once: true, amount: 0.25 }}
        transition={{ duration: 1.1, ease }}
        className="flex flex-col items-center gap-5 rounded-[24px] border border-[#3a3a37] px-5 py-12 text-center md:px-6 md:py-[72px]"
      >
        <Reveal delay={0.12}>
          <h2 className="max-w-[640px] text-[30px] font-semibold leading-[1.1] tracking-[-0.03em] text-white md:text-[38px] lg:text-[44px]">
            Ready to put your agents to work?
          </h2>
        </Reveal>
        <Reveal delay={0.26}>
          <p className="text-[17px] text-[#a8a8a2]">
            Write a goal and let the team handle the rest.
          </p>
        </Reveal>
        <Reveal delay={0.4}>
          <motion.div
            animate={
              reducedMotion
                ? undefined
                : {
                    boxShadow: [
                      "0 6px 24px rgba(59,130,246,0.2)",
                      "0 6px 32px rgba(59,130,246,0.38)",
                      "0 6px 24px rgba(59,130,246,0.2)",
                    ],
                  }
            }
            transition={
              reducedMotion
                ? undefined
                : { duration: 3, repeat: Infinity, ease: "easeInOut" }
            }
            className="rounded-xl"
          >
            <PrimaryButton className="mt-2" />
          </motion.div>
        </Reveal>
      </motion.div>
    </section>
  );
}

function Footer() {
  const { reducedMotion, scrollToSection } = useHomeMotion();
  const footerRef = useRef<HTMLElement>(null);
  const footerInView = useInView(footerRef, { once: true, amount: 0.05 });
  const [bottomDividerStarted, setBottomDividerStarted] = useState(false);

  useEffect(() => {
    if (reducedMotion || !footerInView) return;

    const timeoutId = window.setTimeout(
      () => setBottomDividerStarted(true),
      300,
    );
    return () => window.clearTimeout(timeoutId);
  }, [footerInView, reducedMotion]);

  return (
    <footer
      ref={footerRef}
      className="mt-auto w-full pt-20 lg:pt-32"
    >
      <motion.div
        initial={reducedMotion ? false : { scaleX: 0 }}
        animate={
          reducedMotion || !footerInView ? undefined : { scaleX: 1 }
        }
        transition={{ duration: 1.4, ease }}
        className="h-px origin-left bg-[#3a3a37]"
        aria-hidden="true"
      />
      <div className="mx-auto flex w-full max-w-[1160px] flex-col gap-12 px-5 pb-8 pt-14 sm:px-6">
        <div className="flex flex-col justify-between gap-12 md:flex-row md:gap-14">
          <div className="flex max-w-[300px] flex-col gap-[14px]">
            <Logo />
            <p className="text-sm leading-[1.6] text-[#a8a8a2]">
              A multi-agent system that researches, codes, writes and emails on
              your behalf.
            </p>
          </div>
          <StaggerReveal className="grid grid-cols-2 gap-x-10 gap-y-10 sm:grid-cols-3 sm:gap-x-[72px]">
            {footerColumns.map((column) => (
              <StaggerItem key={column.title}>
                <div className="flex flex-col gap-3">
                  <h3 className="text-[13px] font-medium text-white">
                    {column.title}
                  </h3>
                  {column.links.map((item) =>
                    item.href === "#" ? (
                      <button
                        key={item.label}
                        type="button"
                        className="w-fit text-left text-sm text-[#a8a8a2] transition-colors duration-400 hover:text-white"
                      >
                        {item.label}
                      </button>
                    ) : item.href.startsWith("#") ? (
                      <a
                        key={item.label}
                        href={item.href}
                        onClick={(event) => {
                          event.preventDefault();
                          scrollToSection(item.href.slice(1));
                        }}
                        className="text-sm text-[#a8a8a2] no-underline transition-colors duration-400 hover:text-white"
                      >
                        {item.label}
                      </a>
                    ) : (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="text-sm text-[#a8a8a2] no-underline transition-colors duration-400 hover:text-white"
                      >
                        {item.label}
                      </Link>
                    ),
                  )}
                </div>
              </StaggerItem>
            ))}
          </StaggerReveal>
        </div>
        <div className="relative pt-[22px]">
          <motion.div
            initial={reducedMotion ? false : { scaleX: 0 }}
            animate={
              reducedMotion
                ? undefined
                : { scaleX: bottomDividerStarted ? 1 : 0 }
            }
            transition={{ duration: 1.4, ease }}
            className="absolute inset-x-0 top-0 h-px origin-left bg-[#3a3a37]"
            aria-hidden="true"
          />
          <Reveal delay={0.6}>
            <p className="text-[13px] text-[#9a9a95]">
              © 2026 TaskForce. All rights reserved.
            </p>
          </Reveal>
        </div>
      </div>
    </footer>
  );
}

export default function HomePage() {
  return (
    <SmoothScroll>
      <div className="home-page flex min-h-dvh flex-col bg-[#262624] text-[#eeeeee]">
        <HomeNav />
        <main className="flex-1">
          <Hero />
          <PreviewChat />
          <AgentsSection />
          <HowItWorksSection />
          <ToolsSection />
          <ControlSection />
          <CtaSection />
        </main>
        <Footer />
      </div>
    </SmoothScroll>
  );
}
