"use client";

import { useSyncExternalStore } from "react";

import type { BookingReceipt } from "@/lib/utils/booking-receipt";
import {
  getBookingReceiptsSnapshot,
  getServerBookingReceiptsSnapshot,
  subscribeBookingReceipts,
} from "@/lib/utils/booking-receipt";

export function useBookingReceipt(
  bookingId: string,
): BookingReceipt | null {
  const receipts = useSyncExternalStore(
    subscribeBookingReceipts,
    getBookingReceiptsSnapshot,
    getServerBookingReceiptsSnapshot,
  );

  return receipts[bookingId] ?? null;
}
