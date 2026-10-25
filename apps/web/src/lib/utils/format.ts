const dateFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
});

const dateTimeFormatter = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

const timeFormatter = new Intl.DateTimeFormat("en-US", {
  timeStyle: "short",
});

const monthFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
});

const weekdayFormatter = new Intl.DateTimeFormat("en-US", {
  weekday: "short",
});

const priceFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatDate(value: string | Date): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: string | Date): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatTime(value: string | Date): string {
  return timeFormatter.format(new Date(value));
}

export function formatMonth(value: string | Date): string {
  return monthFormatter.format(new Date(value));
}

export function formatWeekday(value: string | Date): string {
  return weekdayFormatter.format(new Date(value));
}

export function formatDay(value: string | Date): string {
  return new Date(value).getDate().toString();
}

export function formatDateTimeRange(
  startsAt: string | Date,
  endsAt: string | Date,
): string {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (start.toDateString() === end.toDateString()) {
    return `${formatDateTime(start)} – ${formatTime(end)}`;
  }

  return `${formatDateTime(start)} – ${formatDateTime(end)}`;
}

export function formatPrice(value: string | number): string {
  const amount = typeof value === "number" ? value : Number(value);

  return Number.isFinite(amount) ? priceFormatter.format(amount) : "—";
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function getExpiryLabel(
  expiresAt: string,
  now: number | null,
): string {
  if (now === null) {
    return "Checking reservation window…";
  }

  const remaining = new Date(expiresAt).getTime() - now;

  if (remaining <= 0) {
    return "Expired";
  }

  const minutes = Math.max(1, Math.ceil(remaining / 60_000));

  return minutes === 1 ? "1 minute left" : `${minutes} minutes left`;
}

export function isFuture(value: string, now: number | null): boolean {
  return now !== null && new Date(value).getTime() > now;
}

export function isPast(value: string, now: number | null): boolean {
  return now !== null && new Date(value).getTime() < now;
}

export function toDateTimeLocalValue(value: string): string {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function toIsoFromDateTimeLocal(value: string): string {
  return new Date(value).toISOString();
}

export function toStartOfDayIso(value: string): string {
  const date = new Date(`${value}T00:00:00`);

  return date.toISOString();
}

export function toEndOfDayIso(value: string): string {
  const date = new Date(`${value}T23:59:59.999`);

  return date.toISOString();
}

export function toDateInputValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;

  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function getTodayInputValue(): string {
  return toDateInputValue(new Date());
}

export function truncateId(value: string, length = 8): string {
  return value.length > length ? `${value.slice(0, length)}…` : value;
}

export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");

  return initials || "?";
}
