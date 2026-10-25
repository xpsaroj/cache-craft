"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  CalendarDays,
  Clock,
  Ticket,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { PageLoading } from "@/components/ui/page-loading";
import { StatCard } from "@/components/ui/stat-card";
import { listMyBookings } from "@/lib/api/bookings";
import { listMyReservations } from "@/lib/api/reservations";
import { useAuth } from "@/lib/auth/auth-provider";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useBookingEvents } from "@/lib/hooks/use-booking-events";
import { useNow } from "@/lib/hooks/use-now";
import { useReservationDetails } from "@/lib/hooks/use-reservation-details";
import {
  formatDateTimeRange,
  formatNumber,
  formatPrice,
  getExpiryLabel,
  truncateId,
} from "@/lib/utils/format";
import {
  BOOKING_STATUS_LABELS,
  bookingStatusTone,
} from "@/lib/utils/status";

export default function DashboardPage() {
  const { user } = useAuth();
  const now = useNow();
  const reservationDetails = useReservationDetails();
  const { data, error, isLoading, refresh } = useApiQuery(
    `dashboard:${user?.id ?? "unknown"}`,
    async (signal) => {
      const [bookings, reservations] = await Promise.all([
        listMyBookings(signal),
        listMyReservations(signal),
      ]);

      return { bookings, reservations };
    },
    { enabled: Boolean(user) },
  );

  const bookings = data?.bookings ?? [];
  const reservations = data?.reservations ?? [];
  const { events: bookingEvents, isLoading: eventsLoading } =
    useBookingEvents(bookings);

  const activeReservations = reservations
    .filter(
      (reservation) =>
        now !== null && new Date(reservation.expiresAt).getTime() > now,
    )
    .sort(
      (a, b) =>
        new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime(),
    );
  const pendingBookings = bookings.filter(
    (booking) => booking.status === "PENDING",
  );
  const recentReservations = activeReservations.slice(0, 3);
  const recentBookings = bookings.slice(0, 3);

  if (isLoading) {
    return <PageLoading label="Loading your dashboard" />;
  }

  if (error) {
    return (
      <PageContainer className="py-10">
        <ErrorState
          title="Unable to load your dashboard"
          message={error.message}
          onRetry={refresh}
        />
      </PageContainer>
    );
  }

  const firstName = user?.name.trim().split(/\s+/)[0] ?? "there";

  return (
    <PageContainer className="py-10">
      <PageHeader
        eyebrow="Account"
        title={`Welcome back, ${firstName}`}
        description="A quick look at your active seat holds and bookings."
        actions={
          <>
            <Link
              href="/events"
              className={buttonVariants("outline", "md")}
            >
              Browse events
            </Link>
            {user?.role === "ORGANIZER" ? (
              <Link
                href="/organizer/events/new"
                className={buttonVariants("primary", "md")}
              >
                Create event
              </Link>
            ) : null}
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={CalendarClock}
          label="Active holds"
          value={formatNumber(activeReservations.length)}
          helper="Seats held for up to 10 minutes."
        />
        <StatCard
          icon={Ticket}
          label="Bookings"
          value={formatNumber(bookings.length)}
          helper="All bookings on your account."
        />
        <StatCard
          icon={Clock}
          label="Pending"
          value={formatNumber(pendingBookings.length)}
          helper="Bookings awaiting organizer confirmation."
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">
              Active reservations
            </h2>
            <Link
              href="/reservations"
              className="flex items-center gap-1 text-sm font-medium text-brand-strong hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="p-4">
            {recentReservations.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center">
                <p className="text-sm font-medium text-ink">
                  No active seat holds
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Reserve a seat on an event page to hold it for 10 minutes.
                </p>
                <Link
                  href="/events"
                  className={buttonVariants("outline", "sm", "mt-4")}
                >
                  Find an event
                </Link>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentReservations.map((reservation) => {
                  const detail = reservationDetails[reservation.id];

                  return (
                    <li key={reservation.id}>
                      <Link
                        href={`/reservations/${reservation.id}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 transition-colors hover:bg-surface-subtle"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {detail?.eventTitle ??
                              `Reservation ${truncateId(reservation.id)}`}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {detail
                              ? `Seat ${detail.seatCode} · ${detail.venueName}`
                              : `Seat ${truncateId(reservation.seatId)}`}
                          </p>
                        </div>
                        <Badge tone="warning">
                          {getExpiryLabel(reservation.expiresAt, now)}
                        </Badge>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>

        <section className="rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">
              Recent bookings
            </h2>
            <Link
              href="/bookings"
              className="flex items-center gap-1 text-sm font-medium text-brand-strong hover:underline"
            >
              View all
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="p-4">
            {recentBookings.length === 0 ? (
              <div className="rounded-lg border border-dashed border-line px-4 py-8 text-center">
                <p className="text-sm font-medium text-ink">
                  No bookings yet
                </p>
                <p className="mt-1 text-sm text-ink-muted">
                  Once you book a seat, your booking will appear here.
                </p>
              </div>
            ) : (
              <ul className="space-y-2">
                {recentBookings.map((booking) => {
                  const event = bookingEvents[booking.eventId];

                  return (
                    <li key={booking.id}>
                      <Link
                        href={`/bookings/${booking.id}`}
                        className="flex items-center justify-between gap-4 rounded-lg border border-line px-4 py-3 transition-colors hover:bg-surface-subtle"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-ink">
                            {event?.title ??
                              (eventsLoading
                                ? "Loading event…"
                                : `Booking ${truncateId(booking.id)}`)}
                          </p>
                          <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-ink-muted">
                            {event ? (
                              <>
                                <CalendarDays
                                  className="size-3 shrink-0"
                                  aria-hidden
                                />
                                {formatDateTimeRange(
                                  event.startsAt,
                                  event.endsAt,
                                )}
                              </>
                            ) : (
                              `Booking ${truncateId(booking.id)}`
                            )}
                          </p>
                        </div>
                        <div className="flex shrink-0 flex-col items-end gap-1">
                          <Badge tone={bookingStatusTone(booking.status)}>
                            {BOOKING_STATUS_LABELS[booking.status]}
                          </Badge>
                          <span className="text-xs font-medium text-ink">
                            {formatPrice(booking.totalPrice)}
                          </span>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </PageContainer>
  );
}
