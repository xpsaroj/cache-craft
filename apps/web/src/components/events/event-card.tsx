import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
} from "lucide-react";

import type { Event } from "@/types/api";
import { formatDateTimeRange, formatDay, formatMonth, formatWeekday } from "@/lib/utils/format";

export function EventDateBlock({ startsAt }: { startsAt: string }) {
  return (
    <div className="flex w-14 shrink-0 flex-col items-center rounded-lg border border-line bg-surface-subtle py-2">
      <span className="text-xs font-semibold tracking-wider text-brand-strong uppercase">
        {formatMonth(startsAt)}
      </span>
      <span className="text-xl leading-tight font-semibold text-ink">
        {formatDay(startsAt)}
      </span>
      <span className="text-xs text-ink-subtle">
        {formatWeekday(startsAt)}
      </span>
    </div>
  );
}

export function EventCard({ event }: { event: Event }) {
  return (
    <article className="group flex h-full flex-col rounded-xl border border-line bg-surface transition-colors hover:border-line-strong">
      <Link
        href={`/events/${event.id}`}
        className="flex flex-1 flex-col rounded-xl p-5"
      >
        <div className="flex items-start justify-between gap-3">
          <EventDateBlock startsAt={event.startsAt} />
          <ArrowUpRight
            className="mt-1 size-4 text-ink-subtle transition-colors group-hover:text-brand-strong"
            aria-hidden
          />
        </div>

        <h2 className="mt-4 line-clamp-2 text-lg leading-6 font-semibold text-ink group-hover:text-brand-strong">
          {event.title}
        </h2>
        <p className="mt-2 line-clamp-2 text-sm leading-6 text-ink-muted">
          {event.description ??
            "Open the event page for seating and booking details."}
        </p>

        <div className="mt-auto space-y-2 pt-5 text-sm text-ink-muted">
          <p className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{formatDateTimeRange(event.startsAt, event.endsAt)}</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span className="line-clamp-1">
              {event.venue.name}, {event.venue.city}
            </span>
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-line pt-4 text-sm">
          <span className="truncate text-ink-muted">
            {event.organizer.name}
          </span>
          <span className="shrink-0 font-medium text-ink">View event</span>
        </div>
      </Link>
    </article>
  );
}
