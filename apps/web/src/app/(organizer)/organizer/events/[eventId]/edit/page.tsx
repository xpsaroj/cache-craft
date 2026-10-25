import type { Metadata } from "next";

import { EditEvent } from "./edit-event";

export const metadata: Metadata = {
  title: "Edit event",
};

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <EditEvent eventId={eventId} />;
}
