import type {
  DeleteResult,
  Event,
  EventMutationResult,
  EventSeat,
  EventStatus,
  EventStatusResult,
  PaginatedResult,
} from "@/types/api";
import { apiRequest, buildQueryString } from "./client";

export interface EventListParams {
  page?: number;
  limit?: number;
  title?: string;
  description?: string;
  startsAfter?: string;
  endsBefore?: string;
  status?: EventStatus;
  venueId?: string;
  organizerId?: string;
}

export interface EventWriteInput {
  venueId: string;
  title: string;
  description?: string;
  startsAt: string;
  endsAt: string;
  bookingOpensAt: string;
  bookingClosesAt: string;
}

export type UpdateEventInput = Partial<EventWriteInput>;

export interface SeatRowInput {
  row: string;
  seatCount: number;
  price: number;
}

export interface CreateSeatsInput {
  rows: SeatRowInput[];
}

export function listEvents(
  params: EventListParams = {},
  signal?: AbortSignal,
): Promise<PaginatedResult<Event>> {
  return apiRequest<PaginatedResult<Event>>(
    `/events${buildQueryString({ ...params })}`,
    { signal, auth: false },
  );
}

export function getEvent(
  eventId: string,
  signal?: AbortSignal,
): Promise<Event> {
  return apiRequest<Event>(`/events/${eventId}`, { signal, auth: false });
}

export function getEventSeats(
  eventId: string,
  signal?: AbortSignal,
): Promise<EventSeat[]> {
  return apiRequest<EventSeat[]>(`/events/${eventId}/seats`, {
    signal,
    auth: false,
  });
}

export function createEvent(
  input: EventWriteInput,
): Promise<EventMutationResult> {
  return apiRequest<EventMutationResult>("/events", {
    method: "POST",
    body: input,
  });
}

export function updateEvent(
  eventId: string,
  input: UpdateEventInput,
): Promise<EventMutationResult> {
  return apiRequest<EventMutationResult>(`/events/${eventId}`, {
    method: "PATCH",
    body: input,
  });
}

export function deleteEvent(eventId: string): Promise<DeleteResult> {
  return apiRequest<DeleteResult>(`/events/${eventId}`, {
    method: "DELETE",
  });
}

export function publishEvent(eventId: string): Promise<EventStatusResult> {
  return apiRequest<EventStatusResult>(`/events/${eventId}/publish`, {
    method: "POST",
  });
}

export function unpublishEvent(eventId: string): Promise<EventStatusResult> {
  return apiRequest<EventStatusResult>(`/events/${eventId}/unpublish`, {
    method: "POST",
  });
}

export function cancelEvent(eventId: string): Promise<EventStatusResult> {
  return apiRequest<EventStatusResult>(`/events/${eventId}/cancel`, {
    method: "POST",
  });
}

export function createEventSeats(
  eventId: string,
  input: CreateSeatsInput,
): Promise<EventSeat[]> {
  return apiRequest<EventSeat[]>(`/events/${eventId}/seats`, {
    method: "POST",
    body: input,
  });
}
