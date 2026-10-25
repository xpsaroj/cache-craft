import { AlertTriangle, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Unable to load this",
  message,
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-line bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <div className="flex size-11 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-5" aria-hidden />
      </div>
      <h2 className="mt-4 text-base font-semibold text-ink">{title}</h2>
      <p className="mt-1 max-w-md text-sm leading-6 text-ink-muted">
        {message}
      </p>
      {onRetry ? (
        <Button
          variant="outline"
          size="sm"
          className="mt-5"
          onClick={onRetry}
        >
          <RotateCw className="size-4" aria-hidden />
          Try again
        </Button>
      ) : null}
    </div>
  );
}
