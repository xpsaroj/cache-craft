"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarPlus } from "lucide-react";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageLoading } from "@/components/ui/page-loading";
import { Pagination } from "@/components/ui/pagination";
import { Select } from "@/components/ui/select";
import { listEvents } from "@/lib/api/events";
import { useAuth } from "@/lib/auth/auth-provider";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import type { EventStatus } from "@/types/api";
import { EVENT_STATUSES } from "@/types/api";
import {
  formatDateTimeRange,
  formatNumber,
} from "@/lib/utils/format";
import {
  EVENT_STATUS_LABELS,
  eventStatusTone,
} from "@/lib/utils/status";

type StatusFilter = EventStatus | "ALL";

export default function OrganizerEventsPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const { data, error, isLoading, refresh } = useApiQuery(
    `organizer-events:${userId}:${page}:${status}`,
    (signal) =>
      listEvents(
        {
          organizerId: userId,
          page,
          limit: 10,
          status: status === "ALL" ? undefined : status,
        },
        signal,
      ),
    { enabled: Boolean(user) },
  );

  const events = data?.items ?? [];

  return (
    <PageContainer className="py-10">
      <PageHeader
        eyebrow="Organizer"
        title="Your events"
        description="Draft, publish, and manage every event you've created."
        actions={
          <Link
            href="/organizer/events/new"
            className={buttonVariants("primary", "md")}
          >
            <CalendarPlus className="size-4" aria-hidden />
            Create event
          </Link>
        }
      />

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-2">
          <label htmlFor="organizer-status" className="text-sm text-ink-muted">
            Status
          </label>
          <Select
            id="organizer-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as StatusFilter);
              setPage(1);
            }}
            className="w-44"
          >
            <option value="ALL">All statuses</option>
            {EVENT_STATUSES.map((value) => (
              <option key={value} value={value}>
                {EVENT_STATUS_LABELS[value]}
              </option>
            ))}
          </Select>
        </div>
        {data ? (
          <p className="text-sm text-ink-muted">
            {formatNumber(data.pagination.totalItems)}{" "}
            {data.pagination.totalItems === 1 ? "event" : "events"}
          </p>
        ) : null}
      </div>

      {isLoading ? (
        <PageLoading label="Loading your events" />
      ) : error ? (
        <ErrorState
          className="mt-6"
          title="Unable to load your events"
          message={error.message}
          onRetry={refresh}
        />
      ) : events.length === 0 ? (
        <EmptyState
          className="mt-6"
          icon={CalendarPlus}
          title={
            status === "ALL"
              ? "No events yet"
              : "No events with that status"
          }
          description={
            status === "ALL"
              ? "Create your first event, add seats while it's a draft, then publish it."
              : "Try another status or clear the filter to see all of your events."
          }
          action={
            status === "ALL" ? (
              <Link
                href="/organizer/events/new"
                className={buttonVariants("primary", "md")}
              >
                Create an event
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setStatus("ALL");
                  setPage(1);
                }}
                className={buttonVariants("outline", "md")}
              >
                Clear filter
              </button>
            )
          }
        />
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-xl border border-line bg-surface">
            <div className="hidden grid-cols-[minmax(0,1fr)_13rem_8rem_2.5rem] gap-4 border-b border-line bg-surface-subtle px-5 py-3 text-xs font-semibold tracking-wider text-ink-muted uppercase md:grid">
              <span>Event</span>
              <span>Date</span>
              <span>Status</span>
              <span className="sr-only">Open</span>
            </div>
            <ul className="divide-y divide-line">
              {events.map((event) => (
                <li key={event.id}>
                  <Link
                    href={`/organizer/events/${event.id}`}
                    className="grid gap-3 px-5 py-4 transition-colors hover:bg-surface-subtle md:grid-cols-[minmax(0,1fr)_13rem_8rem_2.5rem] md:items-center md:gap-4"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-ink">
                        {event.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-ink-muted">
                        {event.venue.name}, {event.venue.city}
                      </p>
                    </div>
                    <p className="text-sm text-ink-muted">
                      {formatDateTimeRange(event.startsAt, event.endsAt)}
                    </p>
                    <div>
                      <Badge tone={eventStatusTone(event.status)}>
                        {EVENT_STATUS_LABELS[event.status]}
                      </Badge>
                    </div>
                    <span className="hidden justify-self-end text-ink-subtle md:block">
                      <ArrowRight className="size-4" aria-hidden />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {data ? (
            <div className="mt-6">
              <Pagination
                page={data.pagination.page}
                totalPages={data.pagination.totalPages}
                hasPreviousPage={data.pagination.hasPreviousPage}
                hasNextPage={data.pagination.hasNextPage}
                onPageChange={setPage}
              />
            </div>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
