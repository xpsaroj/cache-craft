import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
  helper?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  helper,
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <span className="flex size-8 items-center justify-center rounded-md bg-surface-muted text-ink-muted">
          <Icon className="size-4" aria-hidden />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-ink">
        {value}
      </p>
      {helper ? (
        <p className="mt-1 text-xs leading-5 text-ink-subtle">{helper}</p>
      ) : null}
    </div>
  );
}
