import type {
  BookingStatus,
  EventStatus,
  UserRole,
} from "@/types/api";

export const EVENT_STATUS_LABELS: Record<EventStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  ONGOING: "Ongoing",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  PENDING: "Pending",
  CONFIRMED: "Confirmed",
  CANCELLED: "Cancelled",
  EXPIRED: "Expired",
};

export const ROLE_LABELS: Record<UserRole, string> = {
  CUSTOMER: "Customer",
  ORGANIZER: "Organizer",
};

export function eventStatusTone(
  status: EventStatus,
): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "PUBLISHED":
      return "success";
    case "DRAFT":
      return "neutral";
    case "ONGOING":
      return "info";
    case "COMPLETED":
      return "neutral";
    case "CANCELLED":
      return "danger";
  }
}

export function bookingStatusTone(
  status: BookingStatus,
): "neutral" | "success" | "warning" | "danger" | "info" {
  switch (status) {
    case "CONFIRMED":
      return "success";
    case "PENDING":
      return "warning";
    case "CANCELLED":
      return "danger";
    case "EXPIRED":
      return "neutral";
  }
}
