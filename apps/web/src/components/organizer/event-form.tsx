"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Input, Textarea } from "@/components/ui/input";
import {
  createEvent,
  updateEvent,
  type EventWriteInput,
} from "@/lib/api/events";
import { getErrorMessage, getFieldErrors } from "@/lib/api/client";
import { useToast } from "@/lib/toast/toast-provider";
import type { Event, EventMutationResult } from "@/types/api";
import {
  eventFormSchema,
  type EventFormValues,
} from "@/lib/validation/event";
import {
  toDateTimeLocalValue,
  toIsoFromDateTimeLocal,
} from "@/lib/utils/format";

interface EventFormProps {
  mode: "create" | "edit";
  event?: Event;
}

const fieldNames = [
  "venueId",
  "title",
  "description",
  "startsAt",
  "endsAt",
  "bookingOpensAt",
  "bookingClosesAt",
] as const;

const emptyDefaults: EventFormValues = {
  venueId: "",
  title: "",
  description: "",
  startsAt: "",
  endsAt: "",
  bookingOpensAt: "",
  bookingClosesAt: "",
};

function createDefaults(): EventFormValues {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 7);
  startsAt.setMinutes(0, 0, 0);

  const endsAt = new Date(startsAt.getTime() + 3 * 60 * 60 * 1000);
  const bookingOpensAt = new Date();
  bookingOpensAt.setMinutes(0, 0, 0);
  const bookingClosesAt = new Date(startsAt.getTime() - 60 * 60 * 1000);

  return {
    venueId: "",
    title: "",
    description: "",
    startsAt: toDateTimeLocalValue(startsAt.toISOString()),
    endsAt: toDateTimeLocalValue(endsAt.toISOString()),
    bookingOpensAt: toDateTimeLocalValue(bookingOpensAt.toISOString()),
    bookingClosesAt: toDateTimeLocalValue(bookingClosesAt.toISOString()),
  };
}

function valuesFromEvent(event: Event): EventFormValues {
  return {
    venueId: event.venue.id,
    title: event.title,
    description: event.description ?? "",
    startsAt: toDateTimeLocalValue(event.startsAt),
    endsAt: toDateTimeLocalValue(event.endsAt),
    bookingOpensAt: toDateTimeLocalValue(event.bookingOpensAt),
    bookingClosesAt: toDateTimeLocalValue(event.bookingClosesAt),
  };
}

export function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? valuesFromEvent(event) : emptyDefaults,
    mode: "onTouched",
  });

  useEffect(() => {
    reset(event ? valuesFromEvent(event) : createDefaults());
  }, [event, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);

    const payload: EventWriteInput = {
      venueId: values.venueId.trim(),
      title: values.title.trim(),
      description: values.description.trim(),
      startsAt: toIsoFromDateTimeLocal(values.startsAt),
      endsAt: toIsoFromDateTimeLocal(values.endsAt),
      bookingOpensAt: toIsoFromDateTimeLocal(values.bookingOpensAt),
      bookingClosesAt: toIsoFromDateTimeLocal(values.bookingClosesAt),
    };

    try {
      const result: EventMutationResult =
        mode === "create"
          ? await createEvent(payload)
          : await updateEvent(event!.id, payload);

      toast({
        title: mode === "create" ? "Event created" : "Event updated",
        description:
          mode === "create"
            ? "Add seats while the event is still a draft, then publish it."
            : "Your changes have been saved.",
        variant: "success",
      });
      router.push(`/organizer/events/${result.id}`);
    } catch (error) {
      const fieldErrors = getFieldErrors(error);
      let mappedField = false;

      for (const fieldError of fieldErrors) {
        const key = fieldError.field as (typeof fieldNames)[number];
        const message = fieldError.messages[0];

        if (message && fieldNames.includes(key)) {
          setError(key, { type: "server", message });
          mappedField = true;
        }
      }

      if (!mappedField) {
        setServerError(getErrorMessage(error));
      }
    }
  });

  const cancelHref =
    mode === "edit" && event
      ? `/organizer/events/${event.id}`
      : "/organizer/events";

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-6">
      {serverError ? (
        <Alert
          variant="error"
          title={
            mode === "create"
              ? "Couldn't create this event"
              : "Couldn't save this event"
          }
        >
          {serverError}
        </Alert>
      ) : null}

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-base font-semibold text-ink">Event details</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          Give customers the essentials: a clear title, venue, and
          description.
        </p>
        <div className="mt-5 space-y-4">
          <FormField
            id="event-title"
            label="Title"
            error={errors.title?.message}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                placeholder="An evening of live music"
                {...register("title")}
              />
            )}
          </FormField>

          <FormField
            id="event-venue"
            label="Venue ID"
            description="Enter the UUID of an existing venue. Venue management isn't available in this version."
            error={errors.venueId?.message}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                placeholder="00000000-0000-0000-0000-000000000000"
                className="font-mono text-xs sm:text-sm"
                {...register("venueId")}
              />
            )}
          </FormField>

          <FormField
            id="event-description"
            label="Description"
            description="Optional. Up to 4000 characters."
            error={errors.description?.message}
          >
            {(fieldProps) => (
              <Textarea
                {...fieldProps}
                rows={5}
                placeholder="What should customers know before they book?"
                {...register("description")}
              />
            )}
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-base font-semibold text-ink">Schedule</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          Set when the event starts and ends in your local time.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField
            id="event-starts-at"
            label="Starts at"
            error={errors.startsAt?.message}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="datetime-local"
                step={60}
                {...register("startsAt")}
              />
            )}
          </FormField>
          <FormField
            id="event-ends-at"
            label="Ends at"
            error={errors.endsAt?.message}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="datetime-local"
                step={60}
                {...register("endsAt")}
              />
            )}
          </FormField>
        </div>
      </section>

      <section className="rounded-xl border border-line bg-surface p-6">
        <h2 className="text-base font-semibold text-ink">Booking window</h2>
        <p className="mt-1 text-sm leading-6 text-ink-muted">
          Customers can only reserve seats between these times. Booking must
          close before the event starts.
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <FormField
            id="event-booking-opens"
            label="Booking opens"
            error={errors.bookingOpensAt?.message}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="datetime-local"
                step={60}
                {...register("bookingOpensAt")}
              />
            )}
          </FormField>
          <FormField
            id="event-booking-closes"
            label="Booking closes"
            error={errors.bookingClosesAt?.message}
            required
          >
            {(fieldProps) => (
              <Input
                {...fieldProps}
                type="datetime-local"
                step={60}
                {...register("bookingClosesAt")}
              />
            )}
          </FormField>
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg" isLoading={isSubmitting}>
          {mode === "create" ? "Create event" : "Save changes"}
        </Button>
        <Link
          href={cancelHref}
          className="inline-flex h-11 items-center rounded-md px-4 text-sm font-medium text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
