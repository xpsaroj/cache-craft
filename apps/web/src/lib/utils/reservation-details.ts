const STORAGE_KEY = "cachecraft.reservationDetails";
const RESERVATION_DETAILS_EVENT = "cachecraft:reservation-details";

export interface ReservationDetails {
  reservationId: string;
  eventId: string;
  eventTitle: string;
  venueName: string;
  city: string;
  startsAt: string;
  seatId: string;
  seatCode: string;
  row: string;
  number: number;
  price: string;
}

export type ReservationDetailMap = Record<string, ReservationDetails>;

const EMPTY_MAP: ReservationDetailMap = {};
let cachedRaw: string | null | undefined;
let cachedMap: ReservationDetailMap = EMPTY_MAP;

function isReservationDetails(value: unknown): value is ReservationDetails {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.reservationId === "string" &&
    typeof record.eventId === "string" &&
    typeof record.eventTitle === "string" &&
    typeof record.venueName === "string" &&
    typeof record.city === "string" &&
    typeof record.startsAt === "string" &&
    typeof record.seatId === "string" &&
    typeof record.seatCode === "string" &&
    typeof record.row === "string" &&
    typeof record.number === "number" &&
    typeof record.price === "string"
  );
}

function parseMap(raw: string | null): ReservationDetailMap {
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
        (entry): entry is [string, ReservationDetails] =>
          isReservationDetails(entry[1]),
      ),
    );
  } catch {
    return {};
  }
}

function readMap(): ReservationDetailMap {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return parseMap(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return {};
  }
}

function writeMap(map: ReservationDetailMap): void {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new Event(RESERVATION_DETAILS_EVENT));
  } catch {
    return;
  }
}

export function subscribeReservationDetails(
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
  window.addEventListener(RESERVATION_DETAILS_EVENT, handleChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(RESERVATION_DETAILS_EVENT, handleChange);
  };
}

export function getReservationDetailsSnapshot(): ReservationDetailMap {
  if (typeof window === "undefined") {
    return EMPTY_MAP;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

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

export function getServerReservationDetailsSnapshot(): ReservationDetailMap {
  return EMPTY_MAP;
}

export function readReservationDetails(): ReservationDetailMap {
  return readMap();
}

export function saveReservationDetail(detail: ReservationDetails): void {
  const map = readMap();
  map[detail.reservationId] = detail;
  writeMap(map);
}

export function removeReservationDetail(reservationId: string): void {
  const map = readMap();
  delete map[reservationId];
  writeMap(map);
}

export function removeReservationDetails(reservationIds: string[]): void {
  const map = readMap();

  for (const id of reservationIds) {
    delete map[id];
  }

  writeMap(map);
}
