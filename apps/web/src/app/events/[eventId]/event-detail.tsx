"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Clock,
  EyeOff,
  MapPin,
  UserRound,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { Skeleton } from "@/components/ui/skeleton";
import { getEvent, getEventSeats } from "@/lib/api/events";
import { createReservation } from "@/lib/api/reservations";
import { ApiError, getErrorMessage } from "@/lib/api/client";
import { useAuth } from "@/lib/auth/auth-provider";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useNow } from "@/lib/hooks/use-now";
import { useToast } from "@/lib/toast/toast-provider";
import type { Event, EventSeat } from "@/types/api";
import { cn } from "@/lib/utils/cn";
import { getBookingAvailability } from "@/lib/utils/event-availability";
import {
  formatDateTime,
  formatDateTimeRange,
  formatDay,
  formatMonth,
  formatPrice,
  formatWeekday,
} from "@/lib/utils/format";
import {
  EVENT_STATUS_LABELS,
  eventStatusTone,
} from "@/lib/utils/status";
import { saveReservationDetail } from "@/lib/utils/reservation-details";

interface EventDetailData {
  event: Event;
  seats: EventSeat[];
}

interface SeatRow {
  row: string;
  seats: EventSeat[];
}

function groupSeats(seats: EventSeat[]): SeatRow[] {
  const rows = new Map<string, EventSeat[]>();

  for (const seat of seats) {
    const row = seat.row.trim().toUpperCase() || "—";
    const current = rows.get(row) ?? [];
    current.push(seat);
    rows.set(row, current);
  }

  return [...rows.entries()]
    .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
    .map(([row, rowSeats]) => ({
      row,
      seats: rowSeats.sort((a, b) => a.number - b.number),
    }));
}

export function EventDetail({ eventId }: { eventId: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { status: authStatus, user } = useAuth();
  const { toast } = useToast();
  const now = useNow();
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [isReserving, setIsReserving] = useState(false);

  const { data, error, isLoading, isRefreshing, refresh } =
    useApiQuery<EventDetailData>(`event:${eventId}`, async (signal) => {
      const [event, seats] = await Promise.all([
        getEvent(eventId, signal),
        getEventSeats(eventId, signal),
      ]);

      return { event, seats };
    });

  const seats = useMemo(() => data?.seats ?? [], [data]);
  const seatRows = useMemo(() => groupSeats(seats), [seats]);
  const selectedSeat =
    seats.find((seat) => seat.id === selectedSeatId) ?? null;

  const event = data?.event ?? null;
  const availability = event
    ? getBookingAvailability(event, now)
    : null;
  const isOwner =
    Boolean(event && user) &&
    user?.role === "ORGANIZER" &&
    user.id === event?.organizer.id;
  const loginHref = `/login?next=${encodeURIComponent(pathname)}`;

  const handleReserve = async () => {
    if (!event || !selectedSeat || !availability?.canBook) {
      return;
    }

    if (!user) {
      router.push(loginHref);
      return;
    }

    setIsReserving(true);

    try {
      const reservation = await createReservation(event.id, selectedSeat.id);

      saveReservationDetail({
        reservationId: reservation.id,
        eventId: event.id,
        eventTitle: event.title,
        venueName: event.venue.name,
        city: event.venue.city,
        startsAt: event.startsAt,
        seatId: selectedSeat.id,
        seatCode: selectedSeat.seatCode,
        row: selectedSeat.row,
        number: selectedSeat.number,
        price: selectedSeat.price,
      });

      toast({
        title: "Seat reserved",
        description: "Your seat is held for 10 minutes.",
        variant: "success",
      });
      router.push(`/reservations/${reservation.id}`);
    } catch (reserveError) {
      toast({
        title: "Couldn't reserve that seat",
        description: getErrorMessage(reserveError),
        variant: "error",
      });

      if (reserveError instanceof ApiError && reserveError.status === 409) {
        setSelectedSeatId(null);
        refresh();
      }
    } finally {
      setIsReserving(false);
    }
  };

  if (isLoading) {
    return (
      <PageContainer className="py-10">
        <Skeleton className="h-4 w-52" />
        <div className="mt-6 flex flex-col gap-5 sm:flex-row">
          <Skeleton className="size-20 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-3">
            <Skeleton className="h-6 w-28" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-64 rounded-xl" />
          </div>
          <Skeleton className="h-96 rounded-xl" />
        </div>
      </PageContainer>
    );
  }

  if (error || !event) {
    return (
      <PageContainer className="py-10">
        <Breadcrumbs
          items={[
            { label: "Events", href: "/events" },
            { label: "Event" },
          ]}
        />
        <ErrorState
          className="mt-8"
          title={
            error?.status === 404 ? "Event not found" : "Unable to load event"
          }
          message={
            error?.status === 404
              ? "We couldn't find that event. It may have been removed."
              : (error?.message ?? "Something went wrong. Please try again.")
          }
          onRetry={refresh}
        />
      </PageContainer>
    );
  }

  if (event.status === "DRAFT") {
    return (
      <PageContainer className="py-10">
        <Breadcrumbs
          items={[
            { label: "Events", href: "/events" },
            { label: "Event" },
          ]}
        />
        <EmptyState
          className="mt-8"
          icon={EyeOff}
          title="This event isn't available"
          description="The organizer hasn't published this event yet. Check back once it goes live."
          action={
            isOwner ? (
              <Link
                href={`/organizer/events/${event.id}`}
                className={buttonVariants("primary", "md")}
              >
                Manage this draft
              </Link>
            ) : undefined
          }
        />
      </PageContainer>
    );
  }

  const alertVariant =
    availability?.tone === "error"
      ? "error"
      : availability?.tone === "warning"
        ? "warning"
        : "info";

  return (
    <PageContainer className="py-8 sm:py-10">
      <Breadcrumbs
        items={[
          { label: "Events", href: "/events" },
          { label: event.title },
        ]}
      />

      <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-start">
        <div
          className="flex size-20 shrink-0 flex-col items-center justify-center rounded-xl bg-ink"
          aria-hidden
        >
          <span className="text-xs font-semibold tracking-wider text-brand uppercase">
            {formatMonth(event.startsAt)}
          </span>
          <span className="text-3xl leading-none font-semibold text-ink-inverse">
            {formatDay(event.startsAt)}
          </span>
          <span className="mt-0.5 text-xs text-ink-inverse/60">
            {formatWeekday(event.startsAt)}
          </span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={eventStatusTone(event.status)} dot>
              {EVENT_STATUS_LABELS[event.status]}
            </Badge>
            {isOwner ? <Badge tone="brand">Your event</Badge> : null}
          </div>
          <h1 className="mt-3 max-w-3xl text-3xl font-semibold tracking-tight text-balance text-ink sm:text-4xl lg:text-5xl">
            {event.title}
          </h1>
          <div className="mt-4 flex flex-col gap-2 text-sm text-ink-muted sm:flex-row sm:flex-wrap sm:gap-x-6">
            <span className="flex items-start gap-2">
              <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden />
              {formatDateTimeRange(event.startsAt, event.endsAt)}
            </span>
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden />
              {event.venue.name}, {event.venue.city}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <div className="space-y-6">
          <section
            aria-labelledby="about-event-heading"
            className="rounded-xl border border-line bg-surface p-6"
          >
            <h2
              id="about-event-heading"
              className="text-lg font-semibold text-ink"
            >
              About this event
            </h2>
            <p className="mt-3 text-sm leading-7 whitespace-pre-line text-ink-muted">
              {event.description ??
                "The organizer hasn't added a description for this event yet."}
            </p>
          </section>

          <section
            aria-labelledby="event-details-heading"
            className="rounded-xl border border-line bg-surface p-6"
          >
            <h2
              id="event-details-heading"
              className="text-lg font-semibold text-ink"
            >
              When and where
            </h2>
            <dl className="mt-5 space-y-5">
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-ink">
                  <CalendarDays className="size-4 text-ink-muted" aria-hidden />
                  Date and time
                </dt>
                <dd className="mt-1 pl-6 text-sm leading-6 text-ink-muted">
                  {formatDateTimeRange(event.startsAt, event.endsAt)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-ink">
                  <Clock className="size-4 text-ink-muted" aria-hidden />
                  Booking window
                </dt>
                <dd className="mt-1 pl-6 text-sm leading-6 text-ink-muted">
                  {formatDateTime(event.bookingOpensAt)} –{" "}
                  {formatDateTime(event.bookingClosesAt)}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-ink">
                  <MapPin className="size-4 text-ink-muted" aria-hidden />
                  Venue
                </dt>
                <dd className="mt-1 space-y-0.5 pl-6 text-sm leading-6 text-ink-muted">
                  <p className="font-medium text-ink-soft">{event.venue.name}</p>
                  <p>{event.venue.address}</p>
                  <p>
                    {event.venue.city}, {event.venue.country}
                  </p>
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 text-sm font-medium text-ink">
                  <UserRound className="size-4 text-ink-muted" aria-hidden />
                  Organizer
                </dt>
                <dd className="mt-1 pl-6 text-sm leading-6 text-ink-muted">
                  {event.organizer.name}
                </dd>
              </div>
            </dl>
          </section>
        </div>

        <aside className="order-first space-y-4 lg:sticky lg:top-24 lg:order-none">
          <div className="rounded-xl border border-line bg-surface">
            <div className="border-b border-line p-5">
              <h2 className="text-lg font-semibold text-ink">
                Reserve your seat
              </h2>
              <p className="mt-1 text-sm leading-6 text-ink-muted">
                Reserving holds your seat for 10 minutes while you complete
                the booking.
              </p>
            </div>

            <div className="space-y-4 p-5">
              {isOwner ? (
                <Alert
                  variant="info"
                  title="You're viewing your own event"
                  action={
                    <Link
                      href={`/organizer/events/${event.id}`}
                      className={buttonVariants("outline", "sm")}
                    >
                      Manage
                    </Link>
                  }
                >
                  Seat reservations and bookings still follow the regular
                  customer flow.
                </Alert>
              ) : null}

              {availability && !availability.canBook && availability.message ? (
                <Alert variant={alertVariant}>{availability.message}</Alert>
              ) : null}

              {availability?.canBook ? (
                seats.length === 0 ? (
                  <Alert variant="info">
                    Seats haven&apos;t been added for this event yet. Check
                    back soon to reserve one.
                  </Alert>
                ) : (
                  <>
                    <div>
                      <div className="flex items-center justify-between gap-3">
                        <h3 className="text-sm font-medium text-ink">
                          Choose a seat
                        </h3>
                        <span className="text-xs text-ink-subtle">
                          {seats.length} {seats.length === 1 ? "seat" : "seats"}
                        </span>
                      </div>
                      <div className="mt-3 space-y-2">
                        {seatRows.map((row) => (
                          <div
                            key={row.row}
                            className="flex items-center gap-2"
                          >
                            <span className="w-6 shrink-0 text-right text-xs font-medium text-ink-subtle">
                              {row.row}
                            </span>
                            <div className="flex flex-1 flex-wrap gap-1.5">
                              {row.seats.map((seat) => {
                                const selected = seat.id === selectedSeatId;

                                return (
                                  <button
                                    key={seat.id}
                                    type="button"
                                    aria-pressed={selected}
                                    aria-label={`Seat ${seat.seatCode}, price ${formatPrice(seat.price)}`}
                                    title={`Seat ${seat.seatCode} · ${formatPrice(seat.price)}`}
                                    onClick={() =>
                                      setSelectedSeatId(seat.id)
                                    }
                                    className={cn(
                                      "flex h-8 min-w-8 items-center justify-center rounded border px-1 text-xs font-medium transition-colors",
                                      selected
                                        ? "border-ink bg-ink text-ink-inverse"
                                        : "border-line-strong bg-surface text-ink-soft hover:border-brand hover:bg-brand-soft hover:text-brand-strong",
                                    )}
                                  >
                                    {seat.number}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="mt-3 text-xs leading-5 text-ink-subtle">
                        Availability is confirmed when you reserve. If a seat
                        is taken, you can choose another.
                      </p>
                    </div>

                    <div className="space-y-2 border-t border-line pt-4">
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-ink-muted">Selected seat</span>
                        <span className="font-medium text-ink">
                          {selectedSeat?.seatCode ?? "None"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-3 text-sm">
                        <span className="text-ink-muted">Price</span>
                        <span className="font-medium text-ink">
                          {selectedSeat
                            ? formatPrice(selectedSeat.price)
                            : "—"}
                        </span>
                      </div>

                      {authStatus === "loading" ? (
                        <Button className="mt-2 w-full" disabled>
                          Checking your session…
                        </Button>
                      ) : user ? (
                        <Button
                          className="mt-2 w-full"
                          onClick={handleReserve}
                          disabled={!selectedSeat || isRefreshing}
                          isLoading={isReserving}
                        >
                          Reserve seat
                        </Button>
                      ) : (
                        <Link
                          href={loginHref}
                          className={buttonVariants(
                            "primary",
                            "md",
                            "mt-2 w-full",
                          )}
                        >
                          Sign in to reserve
                        </Link>
                      )}
                    </div>
                  </>
                )
              ) : null}
            </div>
          </div>

          <p className="px-1 text-xs leading-5 text-ink-subtle">
            Reservations expire after 10 minutes. No payment details are
            collected in this flow.
          </p>
        </aside>
      </div>
    </PageContainer>
  );
}
