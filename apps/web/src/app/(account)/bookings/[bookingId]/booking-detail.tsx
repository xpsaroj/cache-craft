"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";

import { EventDateBlock } from "@/components/events/event-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { ErrorState } from "@/components/ui/error-state";
import { PageLoading } from "@/components/ui/page-loading";
import {
  cancelBooking,
  getBooking,
} from "@/lib/api/bookings";
import { getErrorMessage } from "@/lib/api/client";
import { getEvent, getEventSeats } from "@/lib/api/events";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useToast } from "@/lib/toast/toast-provider";
import type {
  Booking,
  Event,
  EventSeat,
} from "@/types/api";
import { useBookingReceipt } from "@/lib/hooks/use-booking-receipt";
import {
  formatDateTimeRange,
  formatPrice,
  truncateId,
} from "@/lib/utils/format";
import {
  BOOKING_STATUS_LABELS,
  bookingStatusTone,
} from "@/lib/utils/status";

interface BookingDetailData {
  booking: Booking;
  event: Event | null;
  seats: EventSeat[];
}

export function BookingDetail({ bookingId }: { bookingId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const receipt = useBookingReceipt(bookingId);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const { data, error, isLoading, refresh } = useApiQuery<BookingDetailData>(
    `booking:${bookingId}`,
    async (signal) => {
      const booking = await getBooking(bookingId, signal);
      const [event, seats] = await Promise.all([
        getEvent(booking.eventId, signal).catch(() => null),
        getEventSeats(booking.eventId, signal).catch(() => null),
      ]);

      return { booking, event, seats: seats ?? [] };
    },
  );

  if (isLoading) {
    return <PageLoading label="Loading booking" />;
  }

  if (error || !data) {
    return (
      <PageContainer className="py-10">
        <Breadcrumbs
          items={[
            { label: "Bookings", href: "/bookings" },
            { label: "Booking" },
          ]}
        />
        <ErrorState
          className="mt-8"
          title={
            error?.status === 404 || error?.status === 400
              ? "Booking not found"
              : "Unable to load booking"
          }
          message={
            error?.status === 404 || error?.status === 400
              ? "We couldn't find that booking on your account."
              : (error?.message ?? "Something went wrong. Please try again.")
          }
          onRetry={refresh}
        />
      </PageContainer>
    );
  }

  const { booking } = data;
  const event = data.event ?? receipt?.event ?? null;
  const canCancel =
    booking.status === "PENDING" || booking.status === "CONFIRMED";
  const hasReceipt = receipt?.booking.id === booking.id;
  const receiptItems = hasReceipt ? receipt.booking.items : [];

  const handleCancel = async () => {
    setIsCancelling(true);

    try {
      await cancelBooking(booking.id);
      toast({
        title: "Booking cancelled",
        variant: "success",
      });
      setConfirmOpen(false);
      refresh();
    } catch (cancelError) {
      toast({
        title: "Couldn't cancel this booking",
        description: getErrorMessage(cancelError),
        variant: "error",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <PageContainer className="py-10">
      <Breadcrumbs
        items={[
          { label: "Bookings", href: "/bookings" },
          { label: `Booking ${truncateId(booking.id)}` },
        ]}
      />

      <PageHeader
        className="mt-6"
        eyebrow="Booking"
        title="Booking details"
        description="Review the event, status, and seat details for this booking."
        actions={
          <Button variant="outline" onClick={() => router.push("/bookings")}>
            Back to bookings
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-6">
            <div className="flex items-start gap-4">
              {event ? (
                <EventDateBlock startsAt={event.startsAt} />
              ) : (
                <span className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-muted text-ink-muted">
                  <Ticket className="size-5" aria-hidden />
                </span>
              )}
              <div className="min-w-0">
                {event ? (
                  <Link
                    href={`/events/${event.id}`}
                    className="text-lg font-semibold text-ink underline-offset-4 hover:text-brand-strong hover:underline"
                  >
                    {event.title}
                  </Link>
                ) : (
                  <p className="text-lg font-semibold text-ink">
                    Event details unavailable
                  </p>
                )}
                {event ? (
                  <div className="mt-2 space-y-1 text-sm text-ink-muted">
                    <p className="flex items-center gap-2">
                      <CalendarDays
                        className="size-4 shrink-0"
                        aria-hidden
                      />
                      {formatDateTimeRange(event.startsAt, event.endsAt)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" aria-hidden />
                      {event.venue.name}, {event.venue.city}
                    </p>
                    <p>Organized by {event.organizer.name}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-ink-muted">
                    We couldn&apos;t load this event right now.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section
            aria-labelledby="booking-seats-heading"
            className="rounded-xl border border-line bg-surface"
          >
            <div className="border-b border-line px-6 py-4">
              <h2
                id="booking-seats-heading"
                className="text-base font-semibold text-ink"
              >
                Seats
              </h2>
            </div>
            <div className="p-6">
              {receiptItems.length > 0 ? (
                <ul className="divide-y divide-line">
                  {receiptItems.map((item) => {
                    const seat = receipt?.seats.find(
                      (candidate) => candidate.id === item.seatId,
                    );

                    return (
                      <li
                        key={item.id}
                        className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                      >
                        <div>
                          <p className="text-sm font-medium text-ink">
                            {seat ? `Seat ${seat.seatCode}` : "Reserved seat"}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {seat
                              ? `Row ${seat.row} · Seat ${seat.number}`
                              : truncateId(item.seatId, 12)}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-ink">
                          {formatPrice(item.price)}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <Alert variant="info" title="Seat details unavailable">
                  Seat-level details are only kept in the browser where the
                  booking was completed. The booking total is still shown
                  here.
                </Alert>
              )}
            </div>
          </section>
        </div>

        <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-none">
          <div className="rounded-xl border border-line bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">
                Booking summary
              </h2>
              <Badge tone={bookingStatusTone(booking.status)}>
                {BOOKING_STATUS_LABELS[booking.status]}
              </Badge>
            </div>

            {booking.status === "PENDING" ? (
              <p className="mt-3 text-sm leading-6 text-ink-muted">
                This booking is awaiting confirmation.
              </p>
            ) : null}
            {booking.status === "CANCELLED" ? (
              <p className="mt-3 text-sm leading-6 text-ink-muted">
                This booking has been cancelled.
              </p>
            ) : null}

            <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Total</dt>
                <dd className="font-semibold text-ink">
                  {formatPrice(booking.totalPrice)}
                </dd>
              </div>
              <div className="flex items-start justify-between gap-3">
                <dt className="shrink-0 text-ink-muted">Booking ID</dt>
                <dd className="text-right font-mono text-xs break-all text-ink-soft">
                  {booking.id}
                </dd>
              </div>
            </dl>

            {event ? (
              <Link
                href={`/events/${event.id}`}
                className={buttonVariants("outline", "md", "mt-5 w-full")}
              >
                View event
              </Link>
            ) : null}

            {canCancel ? (
              <Button
                variant="destructive"
                className="mt-2 w-full"
                onClick={() => setConfirmOpen(true)}
              >
                Cancel booking
              </Button>
            ) : null}
          </div>

          <p className="px-1 text-xs leading-5 text-ink-subtle">
            Cancelling a booking can&apos;t be undone. Seats are released
            according to the event&apos;s booking rules.
          </p>
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title="Cancel this booking?"
        description={
          event
            ? `This will cancel your booking for ${event.title}.`
            : "This will cancel your booking."
        }
        confirmLabel="Cancel booking"
        cancelLabel="Keep booking"
        destructive
        isConfirming={isCancelling}
        onConfirm={handleCancel}
        onClose={() => {
          if (!isCancelling) {
            setConfirmOpen(false);
          }
        }}
      />
    </PageContainer>
  );
}
