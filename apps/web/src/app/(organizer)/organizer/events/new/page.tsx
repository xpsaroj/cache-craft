import type { Metadata } from "next";

import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { EventForm } from "@/components/organizer/event-form";

export const metadata: Metadata = {
  title: "Create event",
};

export default function NewEventPage() {
  return (
    <PageContainer className="py-10">
      <Breadcrumbs
        items={[
          { label: "Organizer", href: "/organizer" },
          { label: "Events", href: "/organizer/events" },
          { label: "New event" },
        ]}
      />
      <PageHeader
        className="mt-6"
        eyebrow="Organizer"
        title="Create event"
        description="New events start as drafts. Add seats, review the details, then publish when you're ready."
      />
      <div className="mt-8 max-w-3xl">
        <EventForm mode="create" />
      </div>
    </PageContainer>
  );
}
