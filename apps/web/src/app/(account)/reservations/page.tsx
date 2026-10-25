"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarClock,
  Clock,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageLoading } from "@/components/ui/page-loading";
import { listMyReservations } from "@/lib/api/reservations";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useNow } from "@/lib/hooks/use-now";
import { useReservationDetails } from "@/lib/hooks/use-reservation-details";
import {
  formatDateTime,
  formatNumber,
  formatPrice,
  getExpiryLabel,
  truncateId,
} from "@/lib/utils/format";

export default function ReservationsPage() {
  const now = useNow();
  const reservationDetails = useReservationDetails();
  const { data, error, isLoading, refresh } = useApiQuery(
    "my-reservations",
    (signal) => listMyReservations(signal),
  );

  const reservations = data ?? [];
  const sortedReservations = [...reservations].sort((a, b) => {
    const aActive = now !== null && new Date(a.expiresAt).getTime() > now;
    const bActive = now !== null && new Date(b.expiresAt).getTime() > now;

    if (aActive !== bActive) {
      return aActive ? -1 : 1;
    }

    return (
      new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime()
    );
  });
  const activeCount = sortedReservations.filter(
    (reservation) =>
      now !== null && new Date(reservation.expiresAt).getTime() > now,
  ).length;

  return (
    <PageContainer className="py-10">
      <PageHeader
        eyebrow="Account"
        title="Reservations"
        description="Seat holds waiting for checkout. Each reservation expires after 10 minutes."
        actions={
          <Link href="/events" className={buttonVariants("outline", "md")}>
            Browse events
          </Link>
        }
      />

      {isLoading ? (
        <PageLoading label="Loading your reservations" />
      ) : error ? (
        <ErrorState
          className="mt-8"
          title="Unable to load reservations"
          message={error.message}
          onRetry={refresh}
        />
      ) : reservations.length === 0 ? (
        <EmptyState
          className="mt-8"
          icon={CalendarClock}
          title="No reservations"
          description="Pick a seat on an event page and it will be held here while you complete checkout."
          action={
            <Link href="/events" className={buttonVariants("primary", "md")}>
              Find an event
            </Link>
          }
        />
      ) : (
        <>
          <div className="mt-6 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-muted">
            <p>
              {formatNumber(reservations.length)}{" "}
              {reservations.length === 1 ? "reservation" : "reservations"}
            </p>
            <p>
              <span className="font-medium text-ink">{activeCount}</span>{" "}
              still holding a seat
            </p>
          </div>

          <ul className="mt-4 space-y-3">
            {sortedReservations.map((reservation) => {
              const detail = reservationDetails[reservation.id];
              const active =
                now !== null &&
                new Date(reservation.expiresAt).getTime() > now;

              return (
                <li key={reservation.id}>
                  <Link
                    href={`/reservations/${reservation.id}`}
                    className="flex flex-col gap-4 rounded-xl border border-line bg-surface p-4 transition-colors hover:border-line-strong hover:bg-surface-subtle sm:flex-row sm:items-center"
                  >
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <span className="flex size-11 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-muted text-ink-muted">
                        <CalendarClock className="size-5" aria-hidden />
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-ink">
                          {detail?.eventTitle ??
                            `Reservation ${truncateId(reservation.id)}`}
                        </p>
                        <p className="mt-1 truncate text-sm text-ink-muted">
                          {detail
                            ? `Seat ${detail.seatCode} · ${detail.venueName}, ${detail.city}`
                            : `Seat ${truncateId(reservation.seatId)}`}
                        </p>
                        <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-subtle">
                          <Clock className="size-3.5" aria-hidden />
                          Expires {formatDateTime(reservation.expiresAt)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-line pt-3 sm:flex-col sm:items-end sm:border-t-0 sm:pt-0">
                      <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                        <Badge tone={active ? "warning" : "neutral"}>
                          {getExpiryLabel(reservation.expiresAt, now)}
                        </Badge>
                        {detail ? (
                          <span className="text-xs font-medium text-ink">
                            {formatPrice(detail.price)}
                          </span>
                        ) : null}
                      </div>
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
