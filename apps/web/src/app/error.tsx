"use client";

import { useEffect } from "react";
import Link from "next/link";
import { TriangleAlert } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Button, buttonVariants } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <PageContainer className="flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <div className="flex size-12 items-center justify-center rounded-full bg-danger-soft text-danger">
        <TriangleAlert className="size-5" aria-hidden />
      </div>
      <p className="mt-5 text-xs font-semibold tracking-[0.18em] text-danger uppercase">
        Something went wrong
      </p>
      <h1 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        We hit a snag loading this page.
      </h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-ink-muted sm:text-base">
        Please try again. If the problem continues, head back to the events
        page and pick up where you left off.
      </p>
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <Button onClick={reset}>Try again</Button>
        <Link href="/events" className={buttonVariants("outline", "md")}>
          Browse events
        </Link>
      </div>
      {error.digest ? (
        <p className="mt-6 font-mono text-xs text-ink-subtle">
          Reference: {error.digest}
        </p>
      ) : null}
    </PageContainer>
  );
}
