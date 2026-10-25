"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";

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
import { createBooking } from "@/lib/api/bookings";
import { getErrorMessage } from "@/lib/api/client";
import { getEvent, getEventSeats } from "@/lib/api/events";
import {
  getReservation,
  releaseReservation,
} from "@/lib/api/reservations";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useNow } from "@/lib/hooks/use-now";
import { useReservationDetails } from "@/lib/hooks/use-reservation-details";
import { useToast } from "@/lib/toast/toast-provider";
import type { Event, EventSeat } from "@/types/api";
import { saveBookingReceipt } from "@/lib/utils/booking-receipt";
import {
  formatDateTime,
  formatNumber,
  formatPrice,
  getExpiryLabel,
} from "@/lib/utils/format";
import {
  removeReservationDetail,
} from "@/lib/utils/reservation-details";

interface ReservationEventData {
  event: Event | null;
  seats: EventSeat[];
}

export function ReservationDetail({
  reservationId,
}: {
  reservationId: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const now = useNow();
  const reservationDetails = useReservationDetails();
  const [isBooking, setIsBooking] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [releaseOpen, setReleaseOpen] = useState(false);

  const {
    data: reservation,
    error,
    isLoading,
    refresh,
  } = useApiQuery(
    `reservation:${reservationId}`,
    (signal) => getReservation(reservationId, signal),
  );

  const detail = reservationDetails[reservationId];
  const eventId = detail?.eventId;

  const { data: eventData } = useApiQuery<ReservationEventData>(
    `reservation-event:${eventId ?? "none"}`,
    async (signal) => {
      if (!eventId) {
        return { event: null, seats: [] };
      }

      const [event, seats] = await Promise.all([
        getEvent(eventId, signal),
        getEventSeats(eventId, signal),
      ]);

      return { event, seats };
    },
    { enabled: Boolean(eventId) },
  );

  if (isLoading) {
    return <PageLoading label="Loading reservation" />;
  }

  if (error || !reservation) {
    return (
      <PageContainer className="py-10">
        <Breadcrumbs
          items={[
            { label: "Reservations", href: "/reservations" },
            { label: "Reservation" },
          ]}
        />
        <ErrorState
          className="mt-8"
          title={
            error?.status === 404 || error?.status === 400
              ? "Reservation not found"
              : "Unable to load reservation"
          }
          message={
            error?.status === 404 || error?.status === 400
              ? "We couldn't find that reservation on your account."
              : (error?.message ?? "Something went wrong. Please try again.")
          }
          onRetry={refresh}
        />
      </PageContainer>
    );
  }

  const isExpired =
    now !== null && new Date(reservation.expiresAt).getTime() <= now;
  const event = eventData?.event ?? null;
  const seat =
    eventData?.seats.find((candidate) => candidate.id === reservation.seatId) ??
    null;
  const canCheckout = Boolean(detail && now !== null && !isExpired);

  const handleCheckout = async () => {
    if (!detail || !canCheckout) {
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      const booking = await createBooking(detail.eventId, [
        reservation.seatId,
      ]);

      const receiptSeat =
        eventData?.seats.find(
          (candidate) => candidate.id === reservation.seatId,
        ) ?? null;

      if (eventData?.event && receiptSeat) {
        saveBookingReceipt({
          booking,
          event: eventData.event,
          seats: [receiptSeat],
          savedAt: new Date().toISOString(),
        });
      }

      removeReservationDetail(reservation.id);
      void releaseReservation(reservation.id).catch(() => undefined);

      toast({
        title: "Booking created",
        description: "Your seat is booked. The booking is pending confirmation.",
        variant: "success",
      });
      router.push(`/bookings/${booking.id}`);
    } catch (bookingFailure) {
      setBookingError(getErrorMessage(bookingFailure));
    } finally {
      setIsBooking(false);
    }
  };

  const handleRelease = async () => {
    setIsReleasing(true);

    try {
      await releaseReservation(reservation.id);
      removeReservationDetail(reservation.id);
      toast({ title: "Reservation released", variant: "success" });
      setReleaseOpen(false);
      router.push("/reservations");
    } catch (releaseError) {
      toast({
        title: "Couldn't release this reservation",
        description: getErrorMessage(releaseError),
        variant: "error",
      });
    } finally {
      setIsReleasing(false);
    }
  };

  return (
    <PageContainer className="py-10">
      <Breadcrumbs
        items={[
          { label: "Reservations", href: "/reservations" },
          { label: "Seat reservation" },
        ]}
      />

      <PageHeader
        className="mt-6"
        eyebrow="Checkout"
        title="Complete your booking"
        description="Your seat is being held until the reservation expires."
        actions={
          <Button
            variant="outline"
            onClick={() => router.push("/reservations")}
          >
            Back to reservations
          </Button>
        }
      />

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-6">
            <div className="flex items-start gap-4">
              <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-line bg-surface-muted text-ink-muted">
                <Ticket className="size-5" aria-hidden />
              </span>
              <div className="min-w-0">
                <p className="text-lg font-semibold text-ink">
                  {detail?.eventTitle ?? "Seat reservation"}
                </p>
                {detail ? (
                  <div className="mt-2 space-y-1 text-sm text-ink-muted">
                    <p className="flex items-center gap-2">
                      <CalendarDays
                        className="size-4 shrink-0"
                        aria-hidden
                      />
                      {formatDateTime(detail.startsAt)}
                    </p>
                    <p className="flex items-center gap-2">
                      <MapPin className="size-4 shrink-0" aria-hidden />
                      {detail.venueName}, {detail.city}
                    </p>
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-ink-muted">
                    Event details aren&apos;t stored in this browser for this
                    reservation.
                  </p>
                )}
              </div>
            </div>

            <dl className="mt-6 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
              <div>
                <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                  Seat
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {detail?.seatCode ?? "Unavailable"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                  Price
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {detail ? formatPrice(detail.price) : "—"}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium tracking-wide text-ink-subtle uppercase">
                  Hold expires
                </dt>
                <dd className="mt-1 text-sm font-medium text-ink">
                  {formatDateTime(reservation.expiresAt)}
                </dd>
              </div>
            </dl>

            {!detail ? (
              <Alert variant="warning" className="mt-5">
                This browser doesn&apos;t have the event and seat details for
                this reservation, so checkout can&apos;t be completed here.
                Reserve a seat again from the event page.
              </Alert>
            ) : null}

            {event ? (
              <Link
                href={`/events/${event.id}`}
                className={buttonVariants("outline", "sm", "mt-5")}
              >
                View event
              </Link>
            ) : null}
          </section>

          <section className="rounded-xl border border-line bg-surface p-6">
            <h2 className="text-base font-semibold text-ink">
              How checkout works
            </h2>
            <p className="mt-2 text-sm leading-7 text-ink-muted">
              Booking converts your seat hold into a booking. No payment
              details are collected in this flow. The booking is created
              immediately and the seat hold is released.
            </p>
          </section>
        </div>

        <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-none">
          <div className="rounded-xl border border-line bg-surface p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-semibold text-ink">
                Order summary
              </h2>
              <Badge tone={isExpired ? "danger" : "warning"}>
                {getExpiryLabel(reservation.expiresAt, now)}
              </Badge>
            </div>

            <dl className="mt-4 space-y-3 border-t border-line pt-4 text-sm">
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Seat</dt>
                <dd className="font-medium text-ink">
                  {detail?.seatCode ?? "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Price</dt>
                <dd className="font-medium text-ink">
                  {detail ? formatPrice(detail.price) : "—"}
                </dd>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-line pt-3">
                <dt className="font-medium text-ink">Total</dt>
                <dd className="font-semibold text-ink">
                  {detail ? formatPrice(detail.price) : "—"}
                </dd>
              </div>
            </dl>

            {isExpired ? (
              <Alert variant="warning" className="mt-4">
                This reservation has expired. Reserve a seat again from the
                event page.
              </Alert>
            ) : null}

            {bookingError ? (
              <Alert variant="error" className="mt-4">
                {bookingError}
              </Alert>
            ) : null}

            <Button
              className="mt-5 w-full"
              onClick={handleCheckout}
              isLoading={isBooking}
              disabled={!canCheckout}
            >
              Book this seat
            </Button>

            {now === null && detail ? (
              <p className="mt-2 text-center text-xs text-ink-subtle">
                Checking the reservation window…
              </p>
            ) : null}

            <button
              type="button"
              onClick={() => setReleaseOpen(true)}
              className="mt-3 w-full rounded-sm text-center text-sm font-medium text-ink-muted transition-colors hover:text-danger"
            >
              Release this seat
            </button>
          </div>

          {seat ? (
            <p className="px-1 text-xs leading-5 text-ink-subtle">
              Seat {seat.seatCode} · Row {seat.row}, seat{" "}
              {formatNumber(seat.number)}.
            </p>
          ) : null}
        </aside>
      </div>

      <ConfirmDialog
        open={releaseOpen}
        title="Release this seat?"
        description="The hold will be removed and the seat will become available to other customers."
        confirmLabel="Release seat"
        cancelLabel="Keep reservation"
        destructive
        isConfirming={isReleasing}
        onConfirm={handleRelease}
        onClose={() => {
          if (!isReleasing) {
            setReleaseOpen(false);
          }
        }}
      />
    </PageContainer>
  );
}
