"use client";

type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
};

export default function Textarea({
  value,
  onChange,
  placeholder,
  rows = 5,
  disabled = false,
}: Props) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      rows={rows}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
      className="w-full resize-y rounded-lg border-[0.5px] border-border bg-card px-[12px] py-[10px] text-[13px] text-text outline-none transition-[border-color] duration-150 placeholder:text-faint focus:border-borderStrong disabled:opacity-50"
    />
  );
}
