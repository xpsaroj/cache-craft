import type { ReactNode } from "react";
import { Check } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";

interface AuthShellProps {
  title: string;
  description: string;
  footer?: ReactNode;
  children: ReactNode;
}

const points = [
  "Browse published events and compare what's on.",
  "Hold a seat for 10 minutes while you finish booking.",
  "Keep reservations and bookings together in one account.",
];

export function AuthShell({
  title,
  description,
  footer,
  children,
}: AuthShellProps) {
  return (
    <PageContainer className="py-10 sm:py-14">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-line bg-surface lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <aside className="seat-pattern hidden flex-col justify-between bg-ink p-10 text-ink-inverse lg:flex">
          <div>
            <div className="flex items-center gap-2.5">
              <span
                className="flex size-9 items-center justify-center rounded-md bg-ink-inverse"
                aria-hidden
              >
                <span className="size-3.5 rounded-[3px] bg-brand" />
              </span>
              <span className="text-base font-semibold tracking-tight">
                CacheCraft
              </span>
            </div>
            <h2 className="mt-14 max-w-xs text-3xl leading-tight font-semibold tracking-tight text-balance">
              Find a seat. Keep the plan.
            </h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-ink-inverse/70">
              Browse what&apos;s on, hold a seat, and keep every reservation
              in one account.
            </p>
            <ul className="mt-8 space-y-3">
              {points.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-3 text-sm leading-6 text-ink-inverse/80"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-brand/20">
                    <Check className="size-3 text-brand" aria-hidden />
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <p className="mt-12 text-xs text-ink-inverse/50">
            One account, every reservation.
          </p>
        </aside>

        <div className="p-6 sm:p-10">
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm leading-6 text-ink-muted">
            {description}
          </p>
          <div className="mt-6">{children}</div>
          {footer ? (
            <div className="mt-6 border-t border-line pt-5 text-sm text-ink-muted">
              {footer}
            </div>
          ) : null}
        </div>
      </div>
    </PageContainer>
  );
}
