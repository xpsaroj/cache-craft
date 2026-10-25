import Link from "next/link";
import { MapPinOff } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <PageContainer className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-surface-muted text-ink-muted">
        <MapPinOff className="size-5" aria-hidden />
      </div>
      <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-brand-strong uppercase">
        404
      </p>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        This page isn&apos;t on the seating chart.
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-ink-muted sm:text-base">
        The page you&apos;re looking for may have moved, been cancelled, or
        never existed.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Link href="/events" className={buttonVariants("primary", "md")}>
          Browse events
        </Link>
        <Link href="/" className={buttonVariants("outline", "md")}>
          Back home
        </Link>
      </div>
    </PageContainer>
  );
}
