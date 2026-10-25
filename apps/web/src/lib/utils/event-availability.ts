import type { Event } from "@/types/api";
import { formatDateTime } from "./format";

export type AvailabilityTone = "info" | "warning" | "error";

export interface BookingAvailability {
  canBook: boolean;
  message: string | null;
  tone: AvailabilityTone;
}

export function getBookingAvailability(
  event: Event,
  now: number | null,
): BookingAvailability {
  if (now === null) {
    return {
      canBook: false,
      message: "Checking the booking window…",
      tone: "info",
    };
  }

  if (event.status === "DRAFT") {
    return {
      canBook: false,
      message: "This event hasn't been published yet.",
      tone: "info",
    };
  }

  if (event.status === "CANCELLED") {
    return {
      canBook: false,
      message: "This event has been cancelled.",
      tone: "error",
    };
  }

  if (event.status === "COMPLETED") {
    return {
      canBook: false,
      message: "This event has already finished.",
      tone: "warning",
    };
  }

  if (event.status === "ONGOING") {
    return {
      canBook: false,
      message: "This event is already underway.",
      tone: "warning",
    };
  }

  const startsAt = new Date(event.startsAt).getTime();
  const opensAt = new Date(event.bookingOpensAt).getTime();
  const closesAt = new Date(event.bookingClosesAt).getTime();

  if (now >= startsAt) {
    return {
      canBook: false,
      message: "This event has already started.",
      tone: "warning",
    };
  }

  if (now < opensAt) {
    return {
      canBook: false,
      message: `Booking opens ${formatDateTime(event.bookingOpensAt)}.`,
      tone: "info",
    };
  }

  if (now > closesAt) {
    return {
      canBook: false,
      message: `Booking closed ${formatDateTime(event.bookingClosesAt)}.`,
      tone: "warning",
    };
  }

  return { canBook: true, message: null, tone: "info" };
}
