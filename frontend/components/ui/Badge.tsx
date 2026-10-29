type Tone = "accent" | "success" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  accent: "text-accent bg-accentBg",
  success: "text-success bg-successBg",
  warning: "text-warning bg-warningBg",
  danger: "text-danger bg-dangerBg",
};

export default function Badge({
  tone = "accent",
  children,
  className = "",
}: {
  tone?: Tone;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex rounded-lg text-[11px] leading-4 px-2 py-[3px] ${toneClasses[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
