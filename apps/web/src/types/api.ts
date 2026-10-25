export const USER_ROLES = ["CUSTOMER", "ORGANIZER"] as const;
export type UserRole = (typeof USER_ROLES)[number];

export const EVENT_STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "ONGOING",
  "COMPLETED",
  "CANCELLED",
] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

export const BOOKING_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "CANCELLED",
  "EXPIRED",
] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
}

export interface EventOrganizer {
  id: string;
  name: string;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  city: string;
  country: string;
}

export interface Event {
  id: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string;
  bookingOpensAt: string;
  bookingClosesAt: string;
  status: EventStatus;
  organizer: EventOrganizer;
  venue: Venue;
}

export interface EventSeat {
  id: string;
  eventId: string;
  seatCode: string;
  row: string;
  number: number;
  price: string;
}

export interface Reservation {
  id: string;
  seatId: string;
  userId: string;
  expiresAt: string;
}

export interface Booking {
  id: string;
  eventId: string;
  userId: string;
  status: BookingStatus;
  totalPrice: string;
}

export interface BookingItem {
  id: string;
  bookingId: string;
  seatId: string;
  price: string;
}

export interface BookingWithItems extends Booking {
  items: BookingItem[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: PaginationMeta;
}

export interface ApiEnvelope<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiFieldError {
  field: string;
  messages: string[];
}

export interface ApiErrorEnvelope {
  success: false;
  statusCode: number;
  message: string;
  errors?: ApiFieldError[];
  timestamp: string;
  path: string;
}

export interface EventMutationResult {
  id: string;
  title: string;
  description: string | null;
  organizerId: string;
  venueId: string;
  startsAt: string;
  endsAt: string;
  bookingOpensAt: string;
  bookingClosesAt: string;
}

export interface EventStatusResult {
  id: string;
  status: EventStatus;
}

export interface DeleteResult {
  id: string;
  deleted: true;
}

export interface ReservationDeleteResult {
  id: string;
  seatId: string;
  deleted: true;
}

export interface BookingStatusResult {
  id: string;
  status: BookingStatus;
}
