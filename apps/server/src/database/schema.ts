import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    pgEnum,
    integer,
    numeric,
    unique,
    index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ENUMS
export const userRoleEnum = pgEnum("user_role", [
    "CUSTOMER",
    "ORGANIZER",
]);

export const eventStatusEnum = pgEnum("event_status", [
    "DRAFT",
    "PUBLISHED",
    "ONGOING",
    "COMPLETED",
    "CANCELLED",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
    "PENDING",
    "CONFIRMED",
    "CANCELLED",
    "EXPIRED",
]);


// Enum types
export type UserRole = (typeof userRoleEnum.enumValues)[number];
export type EventStatus = (typeof eventStatusEnum.enumValues)[number];
export type BookingStatus = (typeof bookingStatusEnum.enumValues)[number];


// Enum values
export const UserRole = {
    CUSTOMER: "CUSTOMER",
    ORGANIZER: "ORGANIZER",
} as const;

export const BookingStatus = {
    PENDING: "PENDING",
    CONFIRMED: "CONFIRMED",
    CANCELLED: "CANCELLED",
    EXPIRED: "EXPIRED",
} as const;

export const EventStatus = {
    DRAFT: "DRAFT",
    PUBLISHED: "PUBLISHED",
    ONGOING: "ONGOING",
    COMPLETED: "COMPLETED",
    CANCELLED: "CANCELLED",
} as const;


// USERS
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: text("password_hash").notNull(),
    role: userRoleEnum("role").notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});

// VENUES
export const venues = pgTable("venues", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    address: text("address").notNull(),
    city: varchar("city", { length: 255 }).notNull(),
    country: varchar("country", { length: 255 }).notNull(),
    createdAt: timestamp("created_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", {
        withTimezone: true,
    })
        .defaultNow()
        .notNull(),
});

// EVENTS
export const events = pgTable(
    "events",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        organizerId: uuid("organizer_id")
            .references(() => users.id, {
                onDelete: "cascade",
            })
            .notNull(),
        venueId: uuid("venue_id")
            .references(() => venues.id, {
                onDelete: "cascade",
            })
            .notNull(),
        title: varchar("title", { length: 255 }).notNull(),
        description: text("description"),
        startsAt: timestamp("starts_at", {
            withTimezone: true,
        }).notNull(),
        endsAt: timestamp("ends_at", {
            withTimezone: true,
        }).notNull(),
        bookingOpensAt: timestamp("booking_opens_at", {
            withTimezone: true,
        }).notNull(),
        bookingClosesAt: timestamp("booking_closes_at", {
            withTimezone: true,
        }).notNull(),
        status: eventStatusEnum("status")
            .default("DRAFT")
            .notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
        updatedAt: timestamp("updated_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("events_organizer_idx").on(table.organizerId),
        index("events_venue_idx").on(table.venueId),
    ],
);

// EVENT SEATS
export const eventSeats = pgTable(
    "event_seats",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        eventId: uuid("event_id")
            .references(() => events.id, {
                onDelete: "cascade",
            })
            .notNull(),
        seatCode: varchar("seat_code", {
            length: 10,
        }).notNull(),
        row: varchar("row", {
            length: 10,
        }).notNull(),
        number: integer("number").notNull(),
        price: numeric("price", {
            precision: 10,
            scale: 2,
        }).notNull(),
    },
    (table) => [
        index("event_seats_event_idx").on(table.eventId),
        unique("event_seat_unique").on(table.eventId, table.seatCode),
    ],
);

// BOOKINGS
export const bookings = pgTable(
    "bookings",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        eventId: uuid("event_id")
            .references(() => events.id, {
                onDelete: "cascade",
            })
            .notNull(),
        userId: uuid("user_id")
            .references(() => users.id, {
                onDelete: "cascade",
            })
            .notNull(),
        status: bookingStatusEnum("status")
            .default("PENDING")
            .notNull(),
        totalPrice: numeric("total_price", {
            precision: 10,
            scale: 2,
        }).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("bookings_event_idx").on(table.eventId),
        index("bookings_user_idx").on(table.userId),
    ],
);

// BOOKING ITEMS
export const bookingItems = pgTable(
    "booking_items",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        bookingId: uuid("booking_id")
            .references(() => bookings.id, {
                onDelete: "cascade",
            })
            .notNull(),
        seatId: uuid("seat_id")
            .references(() => eventSeats.id, {
                onDelete: "cascade",
            })
            .notNull(),
        price: numeric("price", {
            precision: 10,
            scale: 2,
        }).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        index("booking_items_booking_idx").on(table.bookingId),
        unique("booking_items_seat_unique").on(table.seatId),
    ],
);

// RESERVATIONS
export const reservations = pgTable(
    "reservations",
    {
        id: uuid("id").defaultRandom().primaryKey(),
        seatId: uuid("seat_id")
            .references(() => eventSeats.id, {
                onDelete: "cascade",
            })
            .notNull(),
        userId: uuid("user_id")
            .references(() => users.id, {
                onDelete: "cascade",
            })
            .notNull(),
        expiresAt: timestamp("expires_at", {
            withTimezone: true,
        }).notNull(),
        createdAt: timestamp("created_at", {
            withTimezone: true,
        })
            .defaultNow()
            .notNull(),
    },
    (table) => [
        unique("reservation_seat_unique").on(table.seatId),
        index("reservation_seat_idx").on(table.seatId),
        index("reservation_user_idx").on(table.userId),
    ],
);


// RELATIONS
export const usersRelations = relations(users, ({ many }) => ({
    events: many(events),
    bookings: many(bookings),
    reservations: many(reservations),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
    events: many(events),
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
    organizer: one(users, {
        fields: [events.organizerId],
        references: [users.id],
    }),
    venue: one(venues, {
        fields: [events.venueId],
        references: [venues.id],
    }),
    seats: many(eventSeats),
    bookings: many(bookings),
}));

export const eventSeatsRelations = relations(
    eventSeats,
    ({ one, many }) => ({
        event: one(events, {
            fields: [eventSeats.eventId],
            references: [events.id],
        }),
        bookingItems: many(bookingItems),
        reservation: one(reservations, {
            fields: [eventSeats.id],
            references: [reservations.seatId],
        }),
    }),
);

export const bookingsRelations = relations(
    bookings,
    ({ one, many }) => ({
        user: one(users, {
            fields: [bookings.userId],
            references: [users.id],
        }),
        event: one(events, {
            fields: [bookings.eventId],
            references: [events.id],
        }),
        items: many(bookingItems),
    }),
);

export const bookingItemsRelations = relations(
    bookingItems,
    ({ one }) => ({
        booking: one(bookings, {
            fields: [bookingItems.bookingId],
            references: [bookings.id],
        }),
        seat: one(eventSeats, {
            fields: [bookingItems.seatId],
            references: [eventSeats.id],
        }),
    }),
);

export const reservationsRelations = relations(
    reservations,
    ({ one }) => ({
        user: one(users, {
            fields: [reservations.userId],
            references: [users.id],
        }),
        seat: one(eventSeats, {
            fields: [reservations.seatId],
            references: [eventSeats.id],
        }),
    }),
);