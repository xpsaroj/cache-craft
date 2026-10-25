"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";

import { EventDateBlock } from "@/components/events/event-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageLoading } from "@/components/ui/page-loading";
import { listMyBookings } from "@/lib/api/bookings";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useBookingEvents } from "@/lib/hooks/use-booking-events";
import {
  formatDateTimeRange,
  formatNumber,
  formatPrice,
  truncateId,
} from "@/lib/utils/format";
import {
  BOOKING_STATUS_LABELS,
  bookingStatusTone,
} from "@/lib/utils/status";

export default function BookingsPage() {
  const { data, error, isLoading, refresh } = useApiQuery(
    "my-bookings",
    (signal) => listMyBookings(signal),
  );
  const bookings = data ?? [];
  const { events, isLoading: eventsLoading } = useBookingEvents(bookings);

  return (
    <PageContainer className="py-10">
      <PageHeader
        eyebrow="Account"
        title="Bookings"
        description="Every booking on your account, with the event details attached."
        actions={
          <Link href="/events" className={buttonVariants("outline", "md")}>
            Browse events
          </Link>
        }
      />

      {isLoading ? (
        <PageLoading label="Loading your bookings" />
      ) : error ? (
        <ErrorState
          className="mt-8"
          title="Unable to load bookings"
          message={error.message}
          onRetry={refresh}
        />
      ) : bookings.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={Ticket}
          title="No bookings yet"
          description="Reserve a seat on an event page, then complete your booking to see it here."
          action={
            <Link href="/events" className={buttonVariants("primary", "md")}>
              Find an event
            </Link>
          }
        />
      ) : (
        <>
          <p className="mt-6 text-sm text-ink-muted">
            {formatNumber(bookings.length)}{" "}
            {bookings.length === 1 ? "booking" : "bookings"}
          </p>
          <ul className="mt-4 space-y-3">
            {bookings.map((booking) => {
              const event = events[booking.eventId];

              return (
                <li key={booking.id}>
                  <Link
                    href={`/bookings/${booking.id}`}
                    className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-subtle sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-4">
                      {event ? (
                        <EventDateBlock startsAt={event.startsAt} />
                      ) : (
                        <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-muted text-ink-muted">
                          <Ticket className="size-5" aria-hidden />
                        </span>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {event?.title ??
                            (eventsLoading
                              ? "Loading event…"
                              : "Event details unavailable")}
                        </p>
                        <div className="mt-1 flex flex-col gap-1 text-sm text-ink-muted sm:flex-row sm:items-center sm:gap-4">
                          {event ? (
                            <>
                              <span className="flex items-center gap-1.5">
                                <CalendarDays
                                  className="size-3.5 shrink-0"
                                  aria-hidden
                                />
                                {formatDateTimeRange(
                                  event.startsAt,
                                  event.endsAt,
                                )}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin
                                  className="size-3.5 shrink-0"
                                  aria-hidden
                                />
                                {event.venue.name}, {event.venue.city}
                              </span>
                            </>
                          ) : (
                            <span>
                              Booking {truncateId(booking.id, 12)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-line pt-3 sm:justify-end sm:border-t-0 sm:pt-0">
                      <Badge tone={bookingStatusTone(booking.status)}>
                        {BOOKING_STATUS_LABELS[booking.status]}
                      </Badge>
                      <span className="text-sm font-semibold text-ink">
                        {formatPrice(booking.totalPrice)}
                      </span>
                      <ArrowRight
                        className="size-4 text-ink-subtle"
                        aria-hidden
                      />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </PageContainer>
  );
}
