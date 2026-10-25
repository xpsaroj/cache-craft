import type { Metadata } from "next";

import { EventDetail } from "./event-detail";

export const metadata: Metadata = {
  title: "Event details",
  description: "Event details, seating, and reservations.",
};

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <EventDetail key={eventId} eventId={eventId} />;
}
