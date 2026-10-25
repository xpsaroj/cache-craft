"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-provider";
import { useApiQuery } from "@/lib/hooks/use-api-query";
import { getEvent } from "@/lib/api/events";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { buttonVariants } from "@/components/ui/button";
import { ErrorState } from "@/components/ui/error-state";
import { PageLoading } from "@/components/ui/page-loading";
import { EventForm } from "@/components/organizer/event-form";

export function EditEvent({ eventId }: { eventId: string }) {
  const { user } = useAuth();
  const { data: event, error, isLoading, refresh } = useApiQuery(
    `organizer-edit-event:${eventId}`,
    (signal) => getEvent(eventId, signal),
    { enabled: Boolean(user) },
  );

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

  const canManage = user?.id === event.organizer.id;
  const canEdit =
    event.status === "DRAFT" || event.status === "PUBLISHED";

  if (!canManage || !canEdit) {
    return (
      <PageContainer className="py-10">
        <Breadcrumbs
          items={[
            { label: "Organizer", href: "/organizer" },
            { label: "Events", href: "/organizer/events" },
            { label: event.title },
          ]}
        />
        <ErrorState
          className="mt-8"
          title={
            canManage ? "This event can't be edited" : "You can't edit this event"
          }
          message={
            canManage
              ? "Only draft and published events can be edited."
              : "This event belongs to another organizer."
          }
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

  return (
    <PageContainer className="py-10">
      <Breadcrumbs
        items={[
          { label: "Organizer", href: "/organizer" },
          { label: "Events", href: "/organizer/events" },
          { label: event.title, href: `/organizer/events/${event.id}` },
          { label: "Edit" },
        ]}
      />
      <PageHeader
        className="mt-6"
        eyebrow="Organizer"
        title="Edit event"
        description="Update the details, schedule, or booking window for this event."
      />
      <div className="mt-8 max-w-3xl">
        <EventForm mode="edit" event={event} />
      </div>
    </PageContainer>
  );
}
