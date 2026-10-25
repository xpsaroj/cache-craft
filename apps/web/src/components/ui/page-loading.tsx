import { Loader2 } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";

export function PageLoading({
  label = "Loading",
  withSkeleton = true,
}: {
  label?: string;
  withSkeleton?: boolean;
}) {
  return (
    <div
      role="status"
      aria-live="polite"
      className="mx-auto w-full max-w-6xl px-4 py-12 sm:px-6 lg:px-8"
    >
      <div className="flex items-center gap-2 text-sm text-ink-muted">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        <span>{label}</span>
      </div>
      {withSkeleton ? (
        <div className="mt-8 space-y-6">
          <div className="space-y-3">
            <Skeleton className="h-8 w-64 max-w-full" />
            <Skeleton className="h-4 w-96 max-w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-52 rounded-xl" />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
