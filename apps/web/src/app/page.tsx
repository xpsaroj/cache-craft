import Link from "next/link";
import {
  Armchair,
  ArrowRight,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  Clock3,
  LayoutGrid,
  Search,
  Ticket,
} from "lucide-react";

import { UpcomingEvents } from "@/components/home/upcoming-events";
import { PageContainer } from "@/components/layout/page-container";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils/cn";

const steps = [
  {
    icon: Search,
    title: "Find an event",
    description:
      "Browse published events with clear dates, venues, and booking windows.",
  },
  {
    icon: Armchair,
    title: "Pick your seat",
    description:
      "Choose a specific seat from the live seating chart and hold it while you check out.",
  },
  {
    icon: Ticket,
    title: "Keep the details",
    description:
      "Your bookings and reservation details stay together in your account.",
  },
];

const seatRows = ["A", "B", "C"];

function SeatPreview() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink-soft bg-ink p-6 text-ink-inverse shadow-xl sm:p-7">
      <div className="seat-pattern pointer-events-none absolute inset-0 opacity-40" />
      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold tracking-wider text-ink-inverse/50 uppercase">
              Seat selection
            </p>
            <p className="mt-2 text-2xl font-semibold tracking-tight">
              Choose exactly where you sit.
            </p>
          </div>
          <span className="rounded-full border border-ink-inverse/15 px-2.5 py-1 text-[11px] font-medium text-ink-inverse/60">
            Preview
          </span>
        </div>

        <div className="mt-7 rounded-xl border border-ink-inverse/10 bg-ink-soft p-4 sm:p-5">
          <div className="mx-auto h-1.5 w-3/4 rounded-full bg-brand" />
          <p className="mt-2 text-center text-[10px] font-semibold tracking-[0.3em] text-ink-inverse/40 uppercase">
            Stage
          </p>

          <div className="mt-5 space-y-2.5" aria-hidden>
            {seatRows.map((row) => (
              <div key={row} className="flex items-center gap-2.5">
                <span className="w-3 text-xs font-medium text-ink-inverse/40">
                  {row}
                </span>
                <div className="flex flex-1 justify-center gap-1.5">
                  {Array.from({ length: 8 }).map((_, index) => {
                    const selected = row === "B" && index === 3;
                    const unavailable =
                      (row === "A" && (index === 0 || index === 7)) ||
                      (row === "C" && index === 5);

                    return (
                      <span
                        key={index}
                        className={cn(
                          "size-5 rounded-[3px] border sm:size-6",
                          selected
                            ? "border-brand bg-brand"
                            : unavailable
                              ? "border-ink-inverse/5 bg-ink-inverse/5"
                              : "border-ink-inverse/20 bg-ink-inverse/10",
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-xs text-ink-inverse/55">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px] border border-ink-inverse/20 bg-ink-inverse/10" />
              Available
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-[2px] bg-brand" />
              Selected
            </span>
          </div>
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-3.5" aria-hidden />
            Held while you check out
          </span>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <section className="border-b border-line">
        <PageContainer className="grid gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_26rem] lg:items-center lg:py-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted">
              <span className="size-1.5 rounded-full bg-brand" aria-hidden />
              Live events, seats, and bookings
            </p>

            <h1 className="mt-6 max-w-3xl text-5xl leading-[1.02] font-semibold tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Find your seat.
              <br />
              <span className="text-brand-strong">Keep the night.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-7 text-ink-muted sm:text-lg sm:leading-8">
              Discover events worth showing up for, reserve the exact seat you
              want, and keep every confirmation in one calm place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/events"
                className={buttonVariants("primary", "lg")}
              >
                Browse events
                <ArrowRight className="size-4" aria-hidden />
              </Link>
              <Link
                href="/organizer/events/new"
                className={buttonVariants("outline", "lg")}
              >
                <CalendarPlus className="size-4" aria-hidden />
                Create an event
              </Link>
            </div>

            <ul className="mt-10 grid gap-3 border-t border-line pt-6 text-sm text-ink-muted sm:grid-cols-3">
              <li className="flex items-center gap-2">
                <Armchair className="size-4 text-brand-strong" aria-hidden />
                Seat-level booking
              </li>
              <li className="flex items-center gap-2">
                <CalendarCheck
                  className="size-4 text-brand-strong"
                  aria-hidden
                />
                Clear booking windows
              </li>
              <li className="flex items-center gap-2">
                <LayoutGrid
                  className="size-4 text-brand-strong"
                  aria-hidden
                />
                Organizer controls
              </li>
            </ul>
          </div>

          <SeatPreview />
        </PageContainer>
      </section>

      <section className="border-b border-line bg-surface-subtle">
        <PageContainer className="py-14 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold tracking-[0.18em] text-brand-strong uppercase">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
              From discovery to the door, in three steps.
            </h2>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="rounded-xl border border-line bg-surface p-6"
              >
                <div className="flex items-center justify-between">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-brand-soft text-brand-strong">
                    <step.icon className="size-5" aria-hidden />
                  </span>
                  <span className="font-mono text-xs text-ink-subtle">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-base font-semibold text-ink">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-ink-muted">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </PageContainer>
      </section>

      <section>
        <PageContainer className="py-14 sm:py-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs font-semibold tracking-[0.18em] text-brand-strong uppercase">
                Upcoming
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                Events with seats waiting.
              </h2>
            </div>
            <Link
              href="/events"
              className="flex items-center gap-1.5 text-sm font-medium text-ink hover:text-brand-strong"
            >
              View all events
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          </div>

          <div className="mt-8">
            <UpcomingEvents />
          </div>
        </PageContainer>
      </section>

      <section className="pb-16 sm:pb-20">
        <PageContainer>
          <div className="relative overflow-hidden rounded-2xl bg-ink px-6 py-10 text-ink-inverse sm:px-10 sm:py-12">
            <div className="seat-pattern pointer-events-none absolute inset-0 opacity-35" />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
              <div>
                <p className="text-xs font-semibold tracking-[0.18em] text-brand uppercase">
                  For organizers
                </p>
                <h2 className="mt-3 max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
                  Build the room. We&apos;ll handle the seat map.
                </h2>
                <p className="mt-4 max-w-xl text-sm leading-7 text-ink-inverse/65 sm:text-base">
                  Draft an event, add seat rows with their own pricing, publish
                  when it&apos;s ready, and keep control as bookings come in.
                </p>
                <ul className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-ink-inverse/60">
                  <li className="flex items-center gap-2">
                    <CalendarDays className="size-4" aria-hidden />
                    Draft-first publishing
                  </li>
                  <li className="flex items-center gap-2">
                    <LayoutGrid className="size-4" aria-hidden />
                    Row-based seat builder
                  </li>
                  <li className="flex items-center gap-2">
                    <CalendarCheck className="size-4" aria-hidden />
                    Booking-aware controls
                  </li>
                </ul>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/organizer/events/new"
                  className={buttonVariants("primary", "lg")}
                >
                  Create an event
                </Link>
                <Link
                  href="/organizer"
                  className={buttonVariants("outline", "lg")}
                >
                  Organizer console
                </Link>
              </div>
            </div>
          </div>
        </PageContainer>
      </section>
    </>
  );
}
