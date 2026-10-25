"use client";

import { useMemo } from "react";

import type { Booking, Event } from "@/types/api";
import { getEvent } from "@/lib/api/events";
import { useApiQuery } from "./use-api-query";

export function useBookingEvents(
  bookings: Booking[] | null | undefined,
): { events: Record<string, Event>; isLoading: boolean } {
  const eventIds = useMemo(
    () =>
      Array.from(new Set((bookings ?? []).map((booking) => booking.eventId))).sort(),
    [bookings],
  );

  const { data, isLoading } = useApiQuery<Record<string, Event>>(
    `booking-events:${eventIds.join(",")}`,
    async (signal) => {
      const events = await Promise.all(
        eventIds.map(async (eventId) => {
          try {
            return await getEvent(eventId, signal);
          } catch {
            return null;
          }
        }),
      );

      return events.reduce<Record<string, Event>>((map, event) => {
        if (event) {
          map[event.id] = event;
        }

        return map;
      }, {});
    },
    { enabled: eventIds.length > 0 },
  );

  return { events: data ?? {}, isLoading };
}
