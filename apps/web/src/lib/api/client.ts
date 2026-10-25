import type {
  ApiEnvelope,
  ApiErrorEnvelope,
  ApiFieldError,
} from "@/types/api";
import {
  clearAccessToken,
  emitUnauthorized,
  readAccessToken,
} from "@/lib/auth/token";

type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE";

interface ApiErrorOptions {
  status: number;
  message: string;
  fieldErrors?: ApiFieldError[];
  technicalMessage?: string;
}

export class ApiError extends Error {
  readonly status: number;
  readonly fieldErrors: ApiFieldError[];
  readonly technicalMessage?: string;

  constructor({
    status,
    message,
    fieldErrors = [],
    technicalMessage,
  }: ApiErrorOptions) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fieldErrors = fieldErrors;
    this.technicalMessage = technicalMessage;
  }

  get isNetworkError(): boolean {
    return this.status === 0;
  }
}

interface RequestOptions {
  method?: HttpMethod;
  body?: unknown;
  signal?: AbortSignal;
  auth?: boolean;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return (
    isRecord(value) &&
    value.success === true &&
    "data" in value
  );
}

function isApiErrorEnvelope(value: unknown): value is ApiErrorEnvelope {
  return (
    isRecord(value) &&
    value.success === false &&
    typeof value.statusCode === "number" &&
    typeof value.message === "string"
  );
}

function parseFieldErrors(value: unknown): ApiFieldError[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (
      !isRecord(item) ||
      typeof item.field !== "string" ||
      !Array.isArray(item.messages)
    ) {
      return [];
    }

    const messages = item.messages.filter(
      (message): message is string => typeof message === "string",
    );

    return messages.length > 0 ? [{ field: item.field, messages }] : [];
  });
}

function mapKnownMessage(message: string | null): string | null {
  if (!message) {
    return null;
  }

  const value = message.trim();

  const rules: Array<[RegExp, string]> = [
    [/^Invalid credentials\.?$/i, "That email or password is incorrect."],
    [
      /^User already exists\.?$/i,
      "An account with this email already exists.",
    ],
    [
      /^Seat is already reserved\.?$/i,
      "One of those seats is no longer available. Please choose another seat.",
    ],
    [
      /^One or more seats are not actively reserved by you\.?$/i,
      "Your seat reservation expired or is no longer active. Please reserve the seats again.",
    ],
    [
      /^One or more seats are invalid for this event\.?$/i,
      "One or more selected seats do not belong to this event.",
    ],
    [/^Event not found\.?$/i, "We couldn't find that event."],
    [/^Reservation not found\.?$/i, "We couldn't find that reservation."],
    [/^Booking not found\.?$/i, "We couldn't find that booking."],
    [
      /^Booking not found or cannot be cancelled\.?$/i,
      "This booking can't be cancelled in its current state.",
    ],
    [
      /^Event start time must be before its end time\.?$/i,
      "The event must end after it starts.",
    ],
    [
      /^Booking opening time must be before booking closing time\.?$/i,
      "Booking must close after it opens.",
    ],
    [
      /^Booking must close before or at the event start time\.?$/i,
      "Booking must close before the event starts.",
    ],
    [
      /^At least one field must be provided for an update\.?$/i,
      "Change at least one field before saving.",
    ],
    [
      /^At least one field \(email or name\) must be provided\.?$/i,
      "Change your name or email before saving.",
    ],
    [
      /^You are not allowed to perform this action on this event\.?$/i,
      "You don't have permission to manage this event.",
    ],
    [/^Insufficient permissions\.?$/i, "You don't have permission to do that."],
    [
      /^Cannot update an event with status (.+)\.?$/i,
      "This event can't be edited in its current state.",
    ],
    [
      /^Cannot create seats for an event with status (.+)\.?$/i,
      "Seats can only be added while the event is a draft.",
    ],
    [
      /^Cannot (publish|unpublish|cancel|delete) an event with status (.+)\.?$/i,
      "This event can't be changed in its current state.",
    ],
    [
      /^Cannot (unpublish|cancel|delete) an event with existing bookings\.?$/i,
      "This event has bookings, so it can't be changed or removed.",
    ],
  ];

  for (const [pattern, friendlyMessage] of rules) {
    if (pattern.test(value)) {
      return friendlyMessage;
    }
  }

  return null;
}

function fallbackMessage(status: number): string {
  if (status === 0) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  if (status === 400) {
    return "That request couldn't be completed. Please review the details and try again.";
  }

  if (status === 401) {
    return "Your session has expired. Please sign in again.";
  }

  if (status === 403) {
    return "You don't have permission to do that.";
  }

  if (status === 404) {
    return "We couldn't find what you were looking for.";
  }

  if (status === 409) {
    return "That action conflicts with the current state. Refresh and try again.";
  }

  if (status === 429) {
    return "Too many requests. Please wait a moment and try again.";
  }

  return "Something went wrong. Please try again.";
}

function resolveUserMessage(
  status: number,
  rawMessage: string | null,
  fieldErrors: ApiFieldError[],
): string {
  const knownMessage = mapKnownMessage(rawMessage);

  if (knownMessage) {
    return knownMessage;
  }

  if (fieldErrors.length > 0) {
    return "Please check the highlighted fields and try again.";
  }

  return fallbackMessage(status);
}

function getApiBaseUrl(): string {
  const value = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!value) {
    throw new ApiError({
      status: 0,
      message:
        "The booking service is not configured. Add NEXT_PUBLIC_API_BASE_URL and restart the app.",
      technicalMessage: "NEXT_PUBLIC_API_BASE_URL is missing.",
    });
  }

  return value.replace(/\/+$/, "");
}

function getErrorMessagePayload(value: unknown): {
  rawMessage: string | null;
  fieldErrors: ApiFieldError[];
} {
  if (isApiErrorEnvelope(value)) {
    return {
      rawMessage: value.message,
      fieldErrors: parseFieldErrors(value.errors),
    };
  }

  if (isRecord(value) && typeof value.message === "string") {
    return {
      rawMessage: value.message,
      fieldErrors: parseFieldErrors(value.errors),
    };
  }

  if (typeof value === "string") {
    return { rawMessage: value, fieldErrors: [] };
  }

  return { rawMessage: null, fieldErrors: [] };
}

async function readResponseBody(response: Response): Promise<unknown> {
  const text = await response.text();

  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return null;
  }
}

export function buildQueryString(
  params: Record<string, string | number | boolean | null | undefined>,
): string {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") {
      continue;
    }

    search.set(key, String(value));
  }

  const query = search.toString();

  return query ? `?${query}` : "";
}

export async function apiRequest<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const {
    method = "GET",
    body,
    signal,
    auth = true,
  } = options;

  const token = auth ? readAccessToken() : null;
  const headers = new Headers({ Accept: "application/json" });

  if (body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal,
      cache: "no-store",
    });
  } catch (error) {
    if (
      signal?.aborted ||
      (error instanceof DOMException && error.name === "AbortError")
    ) {
      throw error;
    }

    throw new ApiError({
      status: 0,
      message: fallbackMessage(0),
      technicalMessage:
        error instanceof Error ? error.message : "Network request failed.",
    });
  }

  const payload = await readResponseBody(response);

  if (!response.ok) {
    if (response.status === 401 && token) {
      clearAccessToken();
      emitUnauthorized();
    }

    const { rawMessage, fieldErrors } = getErrorMessagePayload(payload);
    const message = resolveUserMessage(
      response.status,
      rawMessage,
      fieldErrors,
    );

    throw new ApiError({
      status: response.status,
      message,
      fieldErrors,
      technicalMessage:
        rawMessage ?? `Request failed with status ${response.status}.`,
    });
  }

  if (payload === null) {
    return undefined as T;
  }

  if (isApiEnvelope(payload)) {
    return payload.data as T;
  }

  throw new ApiError({
    status: response.status,
    message: fallbackMessage(response.status),
    technicalMessage: "The API returned an unexpected response shape.",
  });
}

export function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "AbortError";
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

export function getFieldErrors(error: unknown): ApiFieldError[] {
  return error instanceof ApiError ? error.fieldErrors : [];
}
