"use client";

import { useMemo, useState, type FormEvent } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CalendarSearch, Search } from "lucide-react";

import { EventCard } from "@/components/events/event-card";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { listEvents } from "@/lib/api/events";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import {
  formatNumber,
  getTodayInputValue,
  toStartOfDayIso,
} from "@/lib/utils/format";

const PAGE_SIZE = 9;

function parsePage(value: string | null): number {
  const page = Number(value);

  return Number.isInteger(page) && page > 0 ? page : 1;
}

export function EventsBrowser() {
  const searchParams = useSearchParams();
  const page = parsePage(searchParams.get("page"));
  const title = searchParams.get("title")?.trim() ?? "";
  const from = searchParams.get("from") ?? "";

  return (
    <EventsBrowserContent
      key={JSON.stringify([title, from])}
      page={page}
      title={title}
      from={from}
    />
  );
}

function EventsBrowserContent({
  page,
  title,
  from,
}: {
  page: number;
  title: string;
  from: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [titleInput, setTitleInput] = useState(title);
  const [fromInput, setFromInput] = useState(from);

  const todayStart = useMemo(
    () => toStartOfDayIso(getTodayInputValue()),
    [],
  );

  const key = JSON.stringify({ page, title, from });
  const { data, error, isLoading, isRefreshing, refresh } = useApiQuery(
    key,
    (signal) =>
      listEvents(
        {
          page,
          limit: PAGE_SIZE,
          status: "PUBLISHED",
          title: title || undefined,
          startsAfter: from ? toStartOfDayIso(from) : todayStart,
        },
        signal,
      ),
  );

  const events =
    data?.items.filter((event) => event.status === "PUBLISHED") ?? [];
  const hasFilters = Boolean(title || from);
  const pagination = data?.pagination;

  const updateFilters = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();

    const nextTitle = titleInput.trim();

    if (nextTitle) {
      params.set("title", nextTitle);
    }

    if (fromInput) {
      params.set("from", fromInput);
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  const clearFilters = () => {
    setTitleInput("");
    setFromInput("");
    router.push(pathname);
  };

  const changePage = (nextPage: number) => {
    const params = new URLSearchParams();

    if (title) {
      params.set("title", title);
    }

    if (from) {
      params.set("from", from);
    }

    if (nextPage > 1) {
      params.set("page", String(nextPage));
    }

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname);
  };

  return (
    <PageContainer className="py-10 sm:py-12">
      <PageHeader
        eyebrow="Discover"
        title="Events"
        description="Browse published events and pick the seat that works for you."
      />

      <form
        onSubmit={updateFilters}
        className="mt-8 rounded-xl border border-line bg-surface p-4 sm:p-5"
      >
        <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_12rem_auto] sm:items-end">
          <FormField id="event-search" label="Event name">
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="search"
                value={titleInput}
                onChange={(event) => setTitleInput(event.target.value)}
                placeholder="Search by title"
              />
            )}
          </FormField>
          <FormField id="event-from" label="From date">
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="date"
                value={fromInput}
                onChange={(event) => setFromInput(event.target.value)}
              />
            )}
          </FormField>
          <div className="flex items-center gap-2">
            <Button type="submit" className="flex-1 sm:flex-none">
              <Search className="size-4" aria-hidden />
              Search
            </Button>
            {hasFilters ? (
              <Button
                type="button"
                variant="ghost"
                onClick={clearFilters}
              >
                Clear
              </Button>
            ) : null}
          </div>
        </div>
      </form>

      <div className="mt-8 flex min-h-6 items-center justify-between gap-4">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {pagination
            ? `${formatNumber(pagination.totalItems)} ${
                pagination.totalItems === 1 ? "event" : "events"
              }${hasFilters ? " match your filters" : " coming up"}`
            : isRefreshing
              ? "Updating results…"
              : null}
        </p>
        {isRefreshing ? (
          <span className="text-xs text-ink-subtle">Refreshing</span>
        ) : null}
      </div>

      {isLoading ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <ErrorState
          className="mt-4"
          title="Events are unavailable"
          message={error.message}
          onRetry={refresh}
        />
      ) : events.length === 0 ? (
        <EmptyState
          className="mt-4"
          icon={CalendarSearch}
          title={
            hasFilters
              ? "No events match those filters"
              : "No upcoming events"
          }
          description={
            hasFilters
              ? "Try a different title or date, or clear the filters to see everything."
              : "There are no published events on the calendar yet. Check back soon."
          }
          action={
            hasFilters ? (
              <Button variant="outline" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : undefined
          }
        />
      ) : (
        <>
          <div
            aria-busy={isRefreshing || undefined}
            className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
          {pagination ? (
            <div className="mt-8">
              <Pagination
                page={pagination.page}
                totalPages={pagination.totalPages}
                hasPreviousPage={pagination.hasPreviousPage}
                hasNextPage={pagination.hasNextPage}
                onPageChange={changePage}
                isLoading={isRefreshing}
              />
            </div>
          ) : null}
        </>
      )}
    </PageContainer>
  );
}
