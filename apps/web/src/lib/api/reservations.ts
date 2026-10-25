import type {
  Reservation,
  ReservationDeleteResult,
} from "@/types/api";
import { apiRequest } from "./client";

export function createReservation(
  eventId: string,
  seatId: string,
): Promise<Reservation> {
  return apiRequest<Reservation>(`/events/${eventId}/reservations`, {
    method: "POST",
    body: { seatId },
  });
}

export function listMyReservations(
  signal?: AbortSignal,
): Promise<Reservation[]> {
  return apiRequest<Reservation[]>("/reservations/me", { signal });
}

export function getReservation(
  reservationId: string,
  signal?: AbortSignal,
): Promise<Reservation> {
  return apiRequest<Reservation>(`/reservations/${reservationId}`, {
    signal,
  });
}

export function releaseReservation(
  reservationId: string,
): Promise<ReservationDeleteResult> {
  return apiRequest<ReservationDeleteResult>(
    `/reservations/${reservationId}`,
    { method: "DELETE" },
  );
}
