import type { ReactNode } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from "lucide-react";

import { cn } from "@/lib/utils/cn";

export type AlertVariant = "info" | "success" | "warning" | "error";

const styles: Record<
  AlertVariant,
  { container: string; icon: string; Icon: LucideIcon }
> = {
  info: {
    container: "border-info/20 bg-info-soft text-info",
    icon: "text-info",
    Icon: Info,
  },
  success: {
    container: "border-success/20 bg-success-soft text-success",
    icon: "text-success",
    Icon: CheckCircle2,
  },
  warning: {
    container: "border-warning/20 bg-warning-soft text-warning",
    icon: "text-warning",
    Icon: AlertTriangle,
  },
  error: {
    container: "border-danger/20 bg-danger-soft text-danger",
    icon: "text-danger",
    Icon: XCircle,
  },
};

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  className?: string;
  action?: ReactNode;
  children?: ReactNode;
}

export function Alert({
  variant = "info",
  title,
  className,
  action,
  children,
}: AlertProps) {
  const { container, icon, Icon } = styles[variant];

  return (
    <div
      role={variant === "error" ? "alert" : undefined}
      className={cn(
        "flex items-start gap-3 rounded-lg border p-4",
        container,
        className,
      )}
    >
      <Icon className={cn("mt-0.5 size-5 shrink-0", icon)} aria-hidden />
      <div className="min-w-0 flex-1">
        {title ? <p className="text-sm font-semibold">{title}</p> : null}
        {children ? (
          <div
            className={cn(
              "text-sm leading-6",
              title ? "mt-1" : undefined,
              variant === "info" ? "text-ink-soft" : undefined,
            )}
          >
            {children}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
