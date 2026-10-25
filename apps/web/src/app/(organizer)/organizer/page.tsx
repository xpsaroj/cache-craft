"use client";

import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CalendarPlus,
  FilePenLine,
  Globe2,
} from "lucide-react";

import { EventDateBlock } from "@/components/events/event-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { PageLoading } from "@/components/ui/page-loading";
import { StatCard } from "@/components/ui/stat-card";
import { listEvents } from "@/lib/api/events";
import { useAuth } from "@/lib/auth/auth-provider";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import {
  formatDateTimeRange,
  formatNumber,
} from "@/lib/utils/format";
import {
  EVENT_STATUS_LABELS,
  eventStatusTone,
} from "@/lib/utils/status";

export default function OrganizerPage() {
  const { user } = useAuth();
  const userId = user?.id ?? "";
  const { data, error, isLoading, refresh } = useApiQuery(
    `organizer-dashboard:${userId}`,
    async (signal) => {
      const startsAfter = new Date().toISOString();
      const [upcoming, published, drafts, all] = await Promise.all([
        listEvents(
          { organizerId: userId, startsAfter, limit: 5, page: 1 },
          signal,
        ),
        listEvents(
          { organizerId: userId, status: "PUBLISHED", limit: 1, page: 1 },
          signal,
        ),
        listEvents(
          { organizerId: userId, status: "DRAFT", limit: 1, page: 1 },
          signal,
        ),
        listEvents({ organizerId: userId, limit: 1, page: 1 }, signal),
      ]);

      return {
        upcoming: upcoming.items,
        published: published.pagination.totalItems,
        drafts: drafts.pagination.totalItems,
        total: all.pagination.totalItems,
      };
    },
    { enabled: Boolean(user) },
  );

  if (isLoading) {
    return <PageLoading label="Loading the organizer console" />;
  }

  if (error || !data) {
    return (
      <PageContainer className="py-10">
        <ErrorState
          title="Unable to load the organizer console"
          message={error?.message ?? "Something went wrong. Please try again."}
          onRetry={refresh}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer className="py-10">
      <PageHeader
        eyebrow="Organizer"
        title="Organizer overview"
        description="Create events, add seating, and publish when everything is ready."
        actions={
          <>
            <Link
              href="/events"
              className={buttonVariants("outline", "md")}
            >
              Browse public events
            </Link>
            <Link
              href="/organizer/events/new"
              className={buttonVariants("primary", "md")}
            >
              <CalendarPlus className="size-4" aria-hidden />
              Create event
            </Link>
          </>
        }
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Globe2}
          label="Published"
          value={formatNumber(data.published)}
          helper="Visible to customers."
        />
        <StatCard
          icon={FilePenLine}
          label="Drafts"
          value={formatNumber(data.drafts)}
          helper="Not visible until published."
        />
        <StatCard
          icon={CalendarDays}
          label="Total events"
          value={formatNumber(data.total)}
          helper="All events on your account."
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        <section className="rounded-xl border border-line bg-surface">
          <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
            <h2 className="text-base font-semibold text-ink">
              Upcoming events
            </h2>
            <Link
              href="/organizer/events"
              className="flex items-center gap-1 text-sm font-medium text-brand-strong hover:underline"
            >
              All events
              <ArrowRight className="size-3.5" aria-hidden />
            </Link>
          </div>
          <div className="p-4">
            {data.upcoming.length === 0 ? (
              <EmptyState
                icon={CalendarPlus}
                title="No upcoming events"
                description="Create an event, add seats while it's a draft, then publish it for customers."
                action={
                  <Link
                    href="/organizer/events/new"
                    className={buttonVariants("primary", "md")}
                  >
                    Create an event
                  </Link>
                }
                className="border-0 py-8"
              />
            ) : (
              <ul className="space-y-2">
                {data.upcoming.map((event) => (
                  <li key={event.id}>
                    <Link
                      href={`/organizer/events/${event.id}`}
                      className="flex flex-col gap-3 rounded-lg border border-line p-4 transition-colors hover:bg-surface-subtle sm:flex-row sm:items-center sm:justify-between"
                    >
                      <div className="flex min-w-0 items-center gap-3">
                        <EventDateBlock startsAt={event.startsAt} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink">
                            {event.title}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-muted">
                            {formatDateTimeRange(
                              event.startsAt,
                              event.endsAt,
                            )}
                          </p>
                          <p className="mt-0.5 truncate text-xs text-ink-subtle">
                            {event.venue.name}, {event.venue.city}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <Badge tone={eventStatusTone(event.status)}>
                          {EVENT_STATUS_LABELS[event.status]}
                        </Badge>
                        <ArrowRight
                          className="size-4 text-ink-subtle"
                          aria-hidden
                        />
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-semibold text-ink">
              Publishing checklist
            </h2>
            <ol className="mt-3 space-y-3">
              {[
                "Create the event with an existing venue ID.",
                "Add seat rows while the event is a draft.",
                "Publish when the schedule and seating are ready.",
              ].map((item, index) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm leading-6 text-ink-muted"
                >
                  <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-surface-muted text-xs font-semibold text-ink-soft">
                    {index + 1}
                  </span>
                  {item}
                </li>
              ))}
            </ol>
          </div>

          <Alert variant="info" title="Venue IDs required">
            Venue management isn&apos;t part of this API yet. Use an existing
            venue UUID when creating an event.
          </Alert>
        </aside>
      </div>
    </PageContainer>
  );
}
