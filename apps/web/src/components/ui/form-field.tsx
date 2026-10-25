import type { ReactNode } from "react";

import { cn } from "@/lib/utils/cn";

export interface FieldControlProps {
  id: string;
  "aria-describedby": string | undefined;
  "aria-invalid": true | undefined;
  "aria-required": true | undefined;
}

interface FormFieldProps {
  id: string;
  label: string;
  description?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: (props: FieldControlProps) => ReactNode;
}

export function FormField({
  id,
  label,
  description,
  error,
  required = false,
  className,
  children,
}: FormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-1.5", className)}>
      <label
        htmlFor={id}
        className="flex items-baseline gap-1 text-sm font-medium text-ink"
      >
        {label}
        {required ? (
          <span className="text-brand-strong" aria-hidden>
            *
          </span>
        ) : null}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}
      {description ? (
        <p id={descriptionId} className="text-sm leading-5 text-ink-muted">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="text-sm leading-5 text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
