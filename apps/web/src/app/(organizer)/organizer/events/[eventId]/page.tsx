import type { Metadata } from "next";

import { ManageEvent } from "./manage-event";

export const metadata: Metadata = {
  title: "Manage event",
};

export default async function ManageEventPage({
  params,
}: {
  params: Promise<{ eventId: string }>;
}) {
  const { eventId } = await params;

  return <ManageEvent eventId={eventId} />;
}
