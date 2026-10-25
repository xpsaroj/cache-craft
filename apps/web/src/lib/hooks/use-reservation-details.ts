"use client";

import { useSyncExternalStore } from "react";

import {
  getReservationDetailsSnapshot,
  getServerReservationDetailsSnapshot,
  subscribeReservationDetails,
  type ReservationDetailMap,
} from "@/lib/utils/reservation-details";

export function useReservationDetails(): ReservationDetailMap {
  return useSyncExternalStore(
    subscribeReservationDetails,
    getReservationDetailsSnapshot,
    getServerReservationDetailsSnapshot,
  );
}
