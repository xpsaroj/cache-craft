import {
  forwardRef,
  type InputHTMLAttributes,
  type TextareaHTMLAttributes,
} from "react";

import { cn } from "@/lib/utils/cn";

const inputClasses =
  "h-10 w-full rounded-md border border-line-strong bg-surface px-3 text-sm text-ink placeholder:text-ink-subtle transition-colors hover:border-ink-subtle disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted aria-[invalid=true]:border-danger";

export const Input = forwardRef<
  HTMLInputElement,
  InputHTMLAttributes<HTMLInputElement>
>(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(inputClasses, className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(function Textarea({ className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      className={cn(
        inputClasses,
        "min-h-28 resize-y py-2.5 leading-6",
        className,
      )}
      {...props}
    />
  );
});
