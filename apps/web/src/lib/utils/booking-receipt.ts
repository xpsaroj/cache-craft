import type {
  BookingWithItems,
  Event,
  EventSeat,
} from "@/types/api";

const STORAGE_KEY = "cachecraft.bookingReceipt";
const BOOKING_RECEIPT_EVENT = "cachecraft:booking-receipt";

export interface BookingReceipt {
  booking: BookingWithItems;
  event: Event;
  seats: EventSeat[];
  savedAt: string;
}

export type BookingReceiptMap = Record<string, BookingReceipt>;

const EMPTY_MAP: BookingReceiptMap = {};
let cachedRaw: string | null | undefined;
let cachedMap: BookingReceiptMap = EMPTY_MAP;

function isBookingReceipt(value: unknown): value is BookingReceipt {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.booking === "object" &&
    record.booking !== null &&
    typeof record.event === "object" &&
    record.event !== null &&
    Array.isArray(record.seats) &&
    typeof record.savedAt === "string"
  );
}

function parseMap(raw: string | null): BookingReceiptMap {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);

    if (typeof parsed !== "object" || parsed === null) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(
        (entry): entry is [string, BookingReceipt] =>
          isBookingReceipt(entry[1]),
      ),
    );
  } catch {
    return {};
  }
}

function readMap(): BookingReceiptMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return parseMap(window.sessionStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
}

export function subscribeBookingReceipts(
  onStoreChange: () => void,
): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === STORAGE_KEY) {
      onStoreChange();
    }
  };
  const handleChange = () => onStoreChange();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(BOOKING_RECEIPT_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(BOOKING_RECEIPT_EVENT, handleChange);
  };
}

export function getBookingReceiptsSnapshot(): BookingReceiptMap {
  if (typeof window === "undefined") {
    return EMPTY_MAP;
  }

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);

    if (raw === cachedRaw) {
      return cachedMap;
    }

    cachedRaw = raw;
    cachedMap = parseMap(raw);

    return cachedMap;
  } catch {
    return EMPTY_MAP;
  }
}

export function getServerBookingReceiptsSnapshot(): BookingReceiptMap {
  return EMPTY_MAP;
}

export function saveBookingReceipt(receipt: BookingReceipt): void {
  if (typeof window === "undefined") {
    return;
  }

  const map = readMap();
  map[receipt.booking.id] = receipt;

  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(BOOKING_RECEIPT_EVENT));
  } catch {
    return;
  }
}

export function readBookingReceipt(
  bookingId: string,
): BookingReceipt | null {
  if (typeof window === "undefined") {
    return null;
  }

  return readMap()[bookingId] ?? null;
}
