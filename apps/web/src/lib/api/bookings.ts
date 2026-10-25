import type {
  Booking,
  BookingStatusResult,
  BookingWithItems,
} from "@/types/api";
import { apiRequest } from "./client";

export function createBooking(
  eventId: string,
  seatIds: string[],
): Promise<BookingWithItems> {
  return apiRequest<BookingWithItems>(`/events/${eventId}/bookings`, {
    method: "POST",
    body: { seatIds },
  });
}

export function listMyBookings(signal?: AbortSignal): Promise<Booking[]> {
  return apiRequest<Booking[]>("/bookings", { signal });
}

export function getBooking(
  bookingId: string,
  signal?: AbortSignal,
): Promise<Booking> {
  return apiRequest<Booking>(`/bookings/${bookingId}`, { signal });
}

export function cancelBooking(
  bookingId: string,
): Promise<BookingStatusResult> {
  return apiRequest<BookingStatusResult>(
    `/bookings/${bookingId}/cancel`,
    { method: "POST" },
  );
}
