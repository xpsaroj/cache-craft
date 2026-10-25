import { Suspense } from "react";
import type { Metadata } from "next";

import { PageLoading } from "@/components/ui/page-loading";

import { EventsBrowser } from "./events-browser";

export const metadata: Metadata = {
  title: "Events",
  description: "Browse upcoming events and find your next seat.",
};

export default function EventsPage() {
  return (
    <Suspense fallback={<PageLoading label="Loading events" />}>
      <EventsBrowser />
    </Suspense>
  );
}
