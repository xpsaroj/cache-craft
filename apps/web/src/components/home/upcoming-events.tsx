"use client";

import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { EventCard } from "@/components/events/event-card";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { listEvents } from "@/lib/api/events";
import { useApiQuery } from "@/lib/hooks/use-api-query";

export function UpcomingEvents() {
  const { data, error, isLoading } = useApiQuery(
    "home-upcoming-events",
    (signal) =>
      listEvents(
        {
          status: "PUBLISHED",
          startsAfter: new Date().toISOString(),
          limit: 3,
          page: 1,
        },
        signal,
      ),
  );

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded-xl border border-line bg-surface p-5"
          >
            <Skeleton className="size-14" />
            <Skeleton className="mt-5 h-5 w-4/5" />
            <Skeleton className="mt-2 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-2/3" />
            <Skeleton className="mt-6 h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-line bg-surface px-6 py-10 text-center">
        <h3 className="text-base font-semibold text-ink">
          Live events are unavailable right now
        </h3>
        <p className="mx-auto mt-1 max-w-md text-sm leading-6 text-ink-muted">
          The events service isn&apos;t responding. You can still browse the
          full events page or try again in a moment.
        </p>
        <Link
          href="/events"
          className={buttonVariants("outline", "md", "mt-5")}
        >
          Browse all events
        </Link>
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="No upcoming events yet"
        description="New events will appear here as soon as organizers publish them."
        action={
          <Link href="/events" className={buttonVariants("outline", "md")}>
            Browse events
          </Link>
        }
        className="py-10"
      />
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {data.items.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
