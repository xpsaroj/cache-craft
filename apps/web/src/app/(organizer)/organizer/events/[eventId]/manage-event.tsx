"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CalendarDays,
  LayoutGrid,
  MapPin,
  Tag,
  Ticket,
  UserRound,
} from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { SeatRowsForm } from "@/components/organizer/seat-rows-form";
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
import { StatCard } from "@/components/ui/stat-card";
import { getErrorMessage } from "@/lib/api/client";
import {
  cancelEvent,
  deleteEvent,
  getEvent,
  getEventSeats,
  publishEvent,
  unpublishEvent,
} from "@/lib/api/events";
import { useAuth } from "@/lib/auth/auth-provider";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { useToast } from "@/lib/toast/toast-provider";
import type { Event, EventSeat } from "@/types/api";
import {
  formatDateTime,
  formatDateTimeRange,
  formatNumber,
  formatPrice,
} from "@/lib/utils/format";
import {
  EVENT_STATUS_LABELS,
  eventStatusTone,
} from "@/lib/utils/status";

interface ManageEventData {
  event: Event;
  seats: EventSeat[];
}

interface RowSummary {
  row: string;
  count: number;
  minPrice: number;
  maxPrice: number;
}

type ConfirmAction = "publish" | "unpublish" | "cancel" | "delete";

const confirmContent: Record<
  ConfirmAction,
  { title: string; description: string; confirmLabel: string; destructive: boolean }
> = {
  publish: {
    title: "Publish this event?",
    description:
      "The event will appear in public discovery and customers can reserve seats during the booking window.",
    confirmLabel: "Publish event",
    destructive: false,
  },
  unpublish: {
    title: "Move this event back to draft?",
    description:
      "The event will disappear from public discovery. Events with existing bookings can't be unpublished.",
    confirmLabel: "Unpublish",
    destructive: false,
  },
  cancel: {
    title: "Cancel this event?",
    description:
      "The event will be marked as cancelled and tickets can no longer be booked. Events with existing bookings can't be cancelled.",
    confirmLabel: "Cancel event",
    destructive: true,
  },
  delete: {
    title: "Delete this event?",
    description:
      "This permanently removes the event and its seats. Events with existing bookings can't be deleted.",
    confirmLabel: "Delete event",
    destructive: true,
  },
};

export function ManageEvent({ eventId }: { eventId: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [dialog, setDialog] = useState<ConfirmAction | null>(null);
  const [isActing, setIsActing] = useState(false);
  const { data, error, isLoading, refresh } = useApiQuery<ManageEventData>(
    `organizer-event:${eventId}`,
    async (signal) => {
      const [event, seats] = await Promise.all([
        getEvent(eventId, signal),
        getEventSeats(eventId, signal),
      ]);

      return { event, seats };
    },
    { enabled: Boolean(user) },
  );

  const event = data?.event ?? null;
  const seats = useMemo(() => data?.seats ?? [], [data]);
  const rowSummaries = useMemo<RowSummary[]>(() => {
    const rows = new Map<string, RowSummary>();

    for (const seat of seats) {
      const row = seat.row.trim().toUpperCase() || "—";
      const price = Number(seat.price);
      const current = rows.get(row);

      if (!current) {
        rows.set(row, {
          row,
          count: 1,
          minPrice: Number.isFinite(price) ? price : 0,
          maxPrice: Number.isFinite(price) ? price : 0,
        });
        continue;
      }

      current.count += 1;

      if (Number.isFinite(price)) {
        current.minPrice = Math.min(current.minPrice, price);
        current.maxPrice = Math.max(current.maxPrice, price);
      }
    }

    return [...rows.values()].sort((a, b) =>
      a.row.localeCompare(b.row, undefined, { numeric: true }),
    );
  }, [seats]);

  const priceRange = useMemo(() => {
    let min: number | null = null;
    let max: number | null = null;

    for (const seat of seats) {
      const price = Number(seat.price);

      if (!Number.isFinite(price)) {
        continue;
      }

      min = min === null ? price : Math.min(min, price);
      max = max === null ? price : Math.max(max, price);
    }

    if (min === null || max === null) {
      return "—";
    }

    return min === max
      ? formatPrice(min)
      : `${formatPrice(min)} – ${formatPrice(max)}`;
  }, [seats]);

  const handleConfirm = async () => {
    if (!event || !dialog) {
      return;
    }

    setIsActing(true);

    try {
      if (dialog === "publish") {
        await publishEvent(event.id);
        toast({ title: "Event published", variant: "success" });
      } else if (dialog === "unpublish") {
        await unpublishEvent(event.id);
        toast({ title: "Event moved to draft", variant: "success" });
      } else if (dialog === "cancel") {
        await cancelEvent(event.id);
        toast({ title: "Event cancelled", variant: "success" });
      } else {
        await deleteEvent(event.id);
        toast({ title: "Event deleted", variant: "success" });
        router.push("/organizer/events");
        return;
      }

      setDialog(null);
      refresh();
    } catch (actionError) {
      toast({
        title: "Couldn't update this event",
        description: getErrorMessage(actionError),
        variant: "error",
      });
      setDialog(null);
    } finally {
      setIsActing(false);
    }
  };

  if (isLoading) {
    return <PageLoading label="Loading event" />;
  }

  if (error || !event) {
    return (
      <PageContainer className="py-10">
        <Breadcrumbs
          items={[
            { label: "Organizer", href: "/organizer" },
            { label: "Events", href: "/organizer/events" },
            { label: "Event" },
          ]}
        />
        <ErrorState
          className="mt-8"
          title="Event not found"
          message={
            error?.message ?? "We couldn't load this event. Please try again."
          }
          onRetry={refresh}
        />
      </PageContainer>
    );
  }

  if (user?.id !== event.organizer.id) {
    return (
      <PageContainer className="py-10">
        <Breadcrumbs
          items={[
            { label: "Organizer", href: "/organizer" },
            { label: "Events", href: "/organizer/events" },
            { label: "Event" },
          ]}
        />
        <ErrorState
          className="mt-8"
          title="You can't manage this event"
          message="This event belongs to another organizer."
        />
        <div className="mt-4">
          <Link
            href="/organizer/events"
            className={buttonVariants("outline", "md")}
          >
            Back to your events
          </Link>
        </div>
      </PageContainer>
    );
  }

  const canEdit =
    event.status === "DRAFT" || event.status === "PUBLISHED";
  const canCancel =
    event.status === "DRAFT" || event.status === "PUBLISHED";
  const canDelete =
    event.status === "DRAFT" || event.status === "CANCELLED";
  const dialogDetails = dialog ? confirmContent[dialog] : null;

  return (
    <PageContainer className="py-10">
      <Breadcrumbs
        items={[
          { label: "Organizer", href: "/organizer" },
          { label: "Events", href: "/organizer/events" },
          { label: event.title },
        ]}
      />

      <PageHeader
        className="mt-6"
        eyebrow="Organizer"
        title={event.title}
        description={formatDateTimeRange(event.startsAt, event.endsAt)}
        actions={
          <>
            <Badge tone={eventStatusTone(event.status)} dot>
              {EVENT_STATUS_LABELS[event.status]}
            </Badge>
            {canEdit ? (
              <Link
                href={`/organizer/events/${event.id}/edit`}
                className={buttonVariants("outline", "md")}
              >
                Edit
              </Link>
            ) : null}
            {event.status !== "DRAFT" ? (
              <Link
                href={`/events/${event.id}`}
                className={buttonVariants("ghost", "md")}
              >
                View public page
              </Link>
            ) : null}
            {event.status === "DRAFT" ? (
              <Button onClick={() => setDialog("publish")}>
                Publish
              </Button>
            ) : null}
            {event.status === "PUBLISHED" ? (
              <Button
                variant="outline"
                onClick={() => setDialog("unpublish")}
              >
                Unpublish
              </Button>
            ) : null}
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Ticket}
          label="Seats"
          value={formatNumber(seats.length)}
          helper="Total seats in the seating chart."
        />
        <StatCard
          icon={LayoutGrid}
          label="Rows"
          value={formatNumber(rowSummaries.length)}
          helper="Distinct seat rows."
        />
        <StatCard
          icon={Tag}
          label="Price range"
          value={priceRange}
          helper="Seat prices for this event."
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <div className="space-y-6">
          <section className="rounded-xl border border-line bg-surface p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-ink">
                  Event details
                </h2>
                <p className="mt-1 text-sm leading-6 text-ink-muted">
                  The schedule and venue customers will see.
                </p>
              </div>
              <Badge tone={eventStatusTone(event.status)}>
                {EVENT_STATUS_LABELS[event.status]}
              </Badge>
            </div>

            <dl className="mt-5 space-y-4">
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
                  <CalendarDays className="size-4 text-ink-muted" aria-hidden />
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

            <div className="mt-5 border-t border-line pt-4">
              <p className="text-sm leading-7 whitespace-pre-line text-ink-muted">
                {event.description ?? "No description has been added yet."}
              </p>
            </div>
          </section>

          <section className="rounded-xl border border-line bg-surface">
            <div className="flex items-center justify-between gap-3 border-b border-line px-6 py-4">
              <div>
                <h2 className="text-base font-semibold text-ink">Seating</h2>
                <p className="mt-0.5 text-xs text-ink-muted">
                  Add rows while the event is a draft.
                </p>
              </div>
              <span className="text-sm text-ink-muted">
                {formatNumber(seats.length)}{" "}
                {seats.length === 1 ? "seat" : "seats"}
              </span>
            </div>

            <div className="p-6">
              {rowSummaries.length === 0 ? (
                <Alert
                  variant={event.status === "DRAFT" ? "info" : "warning"}
                  title="No seats yet"
                >
                  {event.status === "DRAFT"
                    ? "Add your first rows below. Each row is numbered from 1."
                    : "This event has no seating yet and can't take bookings until seats are added."}
                </Alert>
              ) : (
                <ul className="divide-y divide-line">
                  {rowSummaries.map((row) => (
                    <li
                      key={row.row}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 items-center justify-center rounded-md border border-line bg-surface-subtle text-xs font-semibold text-ink">
                          {row.row}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-ink">
                            Row {row.row}
                          </p>
                          <p className="mt-0.5 text-xs text-ink-muted">
                            {formatNumber(row.count)}{" "}
                            {row.count === 1 ? "seat" : "seats"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm font-medium text-ink">
                        {row.minPrice === row.maxPrice
                          ? formatPrice(row.minPrice)
                          : `${formatPrice(row.minPrice)} – ${formatPrice(row.maxPrice)}`}
                      </p>
                    </li>
                  ))}
                </ul>
              )}

              {event.status === "DRAFT" ? (
                <div className="mt-6 border-t border-line pt-6">
                  <h3 className="text-sm font-semibold text-ink">
                    Add seats
                  </h3>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">
                    New rows are added to the existing chart. This API doesn&apos;t
                    support editing or removing seats after they&apos;re created.
                  </p>
                  <div className="mt-4">
                    <SeatRowsForm
                      eventId={event.id}
                      existingRows={rowSummaries.map((row) => row.row)}
                      onAdded={refresh}
                    />
                  </div>
                </div>
              ) : (
                <p className="mt-5 text-xs leading-5 text-ink-subtle">
                  Seats can only be added while the event is a draft.
                </p>
              )}
            </div>
          </section>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">
              Event actions
            </h2>
            <div className="mt-3 space-y-2">
              {canEdit ? (
                <Link
                  href={`/organizer/events/${event.id}/edit`}
                  className={buttonVariants("outline", "md", "w-full")}
                >
                  Edit details
                </Link>
              ) : null}
              {event.status !== "DRAFT" ? (
                <Link
                  href={`/events/${event.id}`}
                  className={buttonVariants("outline", "md", "w-full")}
                >
                  View public page
                </Link>
              ) : null}
              {event.status === "DRAFT" ? (
                <Button
                  className="w-full"
                  onClick={() => setDialog("publish")}
                >
                  Publish event
                </Button>
              ) : null}
              {event.status === "PUBLISHED" ? (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setDialog("unpublish")}
                >
                  Unpublish
                </Button>
              ) : null}
            </div>
          </div>

          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-danger">Danger zone</h2>
            {canCancel || canDelete ? (
              <div className="mt-3 space-y-4">
                {canCancel ? (
                  <div>
                    <p className="text-sm leading-6 text-ink-muted">
                      Cancel this event to stop bookings. Events with bookings
                      can&apos;t be cancelled.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => setDialog("cancel")}
                    >
                      Cancel event
                    </Button>
                  </div>
                ) : null}
                {canDelete ? (
                  <div className="border-t border-line pt-4">
                    <p className="text-sm leading-6 text-ink-muted">
                      Delete the event permanently. Drafts and cancelled
                      events can be removed.
                    </p>
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mt-2"
                      onClick={() => setDialog("delete")}
                    >
                      Delete event
                    </Button>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-2 text-sm leading-6 text-ink-muted">
                No destructive actions are available for this event status.
              </p>
            )}
          </div>
        </aside>
      </div>

      <ConfirmDialog
        open={Boolean(dialog) && Boolean(dialogDetails)}
        title={dialogDetails?.title ?? "Confirm action"}
        description={dialogDetails?.description}
        confirmLabel={dialogDetails?.confirmLabel}
        destructive={dialogDetails?.destructive}
        isConfirming={isActing}
        onConfirm={handleConfirm}
        onClose={() => {
          if (!isActing) {
            setDialog(null);
          }
        }}
      />
    </PageContainer>
  );
}
