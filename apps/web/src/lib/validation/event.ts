import { z } from "zod";

const dateTimeLocalSchema = z
  .string()
  .min(1, "Choose a date and time.")
  .refine(
    (value) => !Number.isNaN(new Date(value).getTime()),
    "Enter a valid date and time.",
  );

export const eventFormSchema = z
  .object({
    venueId: z
      .string()
      .trim()
      .min(1, "Enter the venue ID.")
      .uuid("Enter a valid venue UUID."),
    title: z
      .string()
      .trim()
      .min(5, "Use at least 5 characters.")
      .max(255, "Use 255 characters or fewer."),
    description: z
      .string()
      .trim()
      .max(4000, "Use 4000 characters or fewer.")
      .refine(
        (value) => value.length === 0 || value.length >= 10,
        "Use at least 10 characters or leave this blank.",
      ),
    startsAt: dateTimeLocalSchema,
    endsAt: dateTimeLocalSchema,
    bookingOpensAt: dateTimeLocalSchema,
    bookingClosesAt: dateTimeLocalSchema,
  })
  .superRefine((values, context) => {
    const startsAt = new Date(values.startsAt);
    const endsAt = new Date(values.endsAt);
    const bookingOpensAt = new Date(values.bookingOpensAt);
    const bookingClosesAt = new Date(values.bookingClosesAt);

    if (startsAt >= endsAt) {
      context.addIssue({
        code: "custom",
        path: ["endsAt"],
        message: "The event must end after it starts.",
      });
    }

    if (bookingOpensAt >= bookingClosesAt) {
      context.addIssue({
        code: "custom",
        path: ["bookingClosesAt"],
        message: "Booking must close after it opens.",
      });
    }

    if (bookingClosesAt > startsAt) {
      context.addIssue({
        code: "custom",
        path: ["bookingClosesAt"],
        message: "Booking must close before the event starts.",
      });
    }
  });

export type EventFormValues = z.infer<typeof eventFormSchema>;

export const seatRowsSchema = z
  .object({
    rows: z
      .array(
        z.object({
          row: z
            .string()
            .trim()
            .min(1, "Enter a row label.")
            .max(10, "Use 10 characters or fewer."),
          seatCount: z
            .number()
            .int("Use a whole number.")
            .min(1, "Add at least one seat.")
            .max(500, "Keep each row at 500 seats or fewer."),
          price: z
            .number()
            .min(0, "Price can't be negative.")
            .max(99_999_999.99, "That price is too large."),
        }),
      )
      .min(1, "Add at least one row."),
  })
  .superRefine(({ rows }, context) => {
    const seen = new Set<string>();

    rows.forEach((row, index) => {
      const key = row.row.trim().toUpperCase();

      if (!key) {
        return;
      }

      if (seen.has(key)) {
        context.addIssue({
          code: "custom",
          path: ["rows", index, "row"],
          message: "Row labels must be unique.",
        });
      }

      seen.add(key);
    });
  });

export type SeatRowsValues = z.infer<typeof seatRowsSchema>;
