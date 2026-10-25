import {
  forwardRef,
  useId,
  type InputHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils/cn";

interface CheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label: string;
  description?: string;
  error?: string;
  containerClassName?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  function Checkbox(
    {
      id,
      label,
      description,
      error,
      className,
      containerClassName,
      ...props
    },
    ref,
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const descriptionId = description ? `${inputId}-description` : undefined;
    const errorId = error ? `${inputId}-error` : undefined;
    const describedBy =
      [descriptionId, errorId].filter(Boolean).join(" ") || undefined;

    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        <div className="flex items-start gap-2.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className={cn(
              "mt-0.5 size-4 shrink-0 rounded border-line-strong accent-brand",
              className,
            )}
            aria-describedby={describedBy}
            aria-invalid={error ? true : undefined}
            {...props}
          />
          <label
            htmlFor={inputId}
            className="text-sm leading-5 font-medium text-ink"
          >
            {label}
          </label>
        </div>
        {description ? (
          <p
            id={descriptionId}
            className="pl-6 text-sm leading-5 text-ink-muted"
          >
            {description}
          </p>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="pl-6 text-sm text-danger">
            {error}
          </p>
        ) : null}
      </div>
    );
  },
);
