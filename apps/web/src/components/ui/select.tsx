import {
  forwardRef,
  type SelectHTMLAttributes,
} from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils/cn";

export const Select = forwardRef<
  HTMLSelectElement,
  SelectHTMLAttributes<HTMLSelectElement>
>(function Select({ className, children, ...props }, ref) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(
          "h-10 w-full appearance-none rounded-md border border-line-strong bg-surface px-3 pr-9 text-sm text-ink transition-colors hover:border-ink-subtle disabled:cursor-not-allowed disabled:bg-surface-muted disabled:text-ink-muted aria-[invalid=true]:border-danger",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-muted"
        aria-hidden
      />
    </div>
  );
});
