import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export type BadgeTone =
  | "neutral"
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info";

const toneClasses: Record<BadgeTone, string> = {
  neutral: "border-line bg-surface-muted text-ink-soft",
  brand: "border-brand/30 bg-brand-soft text-brand-strong",
  success: "border-success/20 bg-success-soft text-success",
  warning: "border-warning/20 bg-warning-soft text-warning",
  danger: "border-danger/20 bg-danger-soft text-danger",
  info: "border-info/20 bg-info-soft text-info",
};

const dotClasses: Record<BadgeTone, string> = {
  neutral: "bg-ink-subtle",
  brand: "bg-brand",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
  info: "bg-info",
};

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  className?: string;
  children: ReactNode;
}

export function Badge({
  tone = "neutral",
  dot = false,
  className,
  children,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        toneClasses[tone],
        className,
      )}
    >
      {dot ? (
        <span
          className={cn("size-1.5 rounded-full", dotClasses[tone])}
          aria-hidden
        />
      ) : null}
      {children}
    </span>
  );
}
