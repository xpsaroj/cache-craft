import type { ReactNode } from "react";
import { Inbox, type LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils/cn";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-line bg-surface px-6 py-14 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
        <Icon className="size-5" aria-hidden />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      {description ? (
        <p className="mt-1 max-w-md text-sm leading-6 text-ink-muted">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
