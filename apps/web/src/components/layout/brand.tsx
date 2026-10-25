import Link from "next/link";

import { cn } from "@/lib/utils/cn";

export function Brand({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-2.5 rounded-sm font-semibold tracking-tight text-ink",
        className,
      )}
      aria-label="CacheCraft home"
    >
      <span
        className="flex size-8 shrink-0 items-center justify-center rounded-md bg-ink"
        aria-hidden
      >
        <span className="size-3 rounded-[3px] bg-brand" />
      </span>
      <span className="text-base">CacheCraft</span>
    </Link>
  );
}
