import { Injectable, Inject } from "@nestjs/common";
import { and, eq, ilike, gte, lte, count, inArray } from 'drizzle-orm';
import type { SQL } from 'drizzle-orm';

import { DRIZZLE } from "src/database/database.constants"
import type { DrizzleDb } from "src/database/database.types";
import { events, eventSeats, EventStatus } from "src/database/schema"
import { CreateEventData, FindEventsFilters, UpdateEventData } from "./events.types";
import { createPaginatedResult } from "src/common/utils/create-paginated-result";

const eventRelations = {
    organizer: {
        columns: {
            id: true,
            name: true,
        },
    },
    venue: {
        columns: {
            id: true,
            name: true,
            address: true,
            city: true,
            country: true,
        },
    },
} as const;

const eventListColumns = {
    id: true,
    title: true,
    description: true,
    startsAt: true,
    endsAt: true,
    bookingOpensAt: true,
    bookingClosesAt: true,
    status: true,
} as const;

@Injectable()
export class EventsRepository {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDb,
    ) { }

    async create(data: CreateEventData) {
        const [event] = await this.db
            .insert(events)
            .values({
                ...data
            })
            .returning({
                id: events.id,
                title: events.title,
                description: events.description,
                organizerId: events.organizerId,
                venueId: events.venueId,
                startsAt: events.startsAt,
                endsAt: events.endsAt,
                bookingOpensAt: events.bookingOpensAt,
                bookingClosesAt: events.bookingClosesAt,
            })

        return event;
    }

    async findById(eventId: string) {
        return this.db.query.events.findFirst({
            where: eq(events.id, eventId),
            columns: eventListColumns,
            with: eventRelations,
        })
    }

    async findMany(filters: FindEventsFilters) {
        const {
            title,
            description,
            startsAfter,
            endsBefore,
            status,
            venueId,
            organizerId,
            page = 1,
            limit = 20,
        } = filters;

        const conditions: SQL[] = [];

        if (title) {
            conditions.push(ilike(events.title, `%${title}%`));
        }

        if (description) {
            conditions.push(ilike(events.description, `%${description}%`));
        }

        if (startsAfter) {
            conditions.push(gte(events.startsAt, startsAfter));
        }

        if (endsBefore) {
            conditions.push(lte(events.endsAt, endsBefore));
        }

        if (status) {
            conditions.push(eq(events.status, status));
        }

        if (venueId) {
            conditions.push(eq(events.venueId, venueId));
        }

        if (organizerId) {
            conditions.push(eq(events.organizerId, organizerId));
        }

        const where = conditions.length > 0
            ? and(...conditions)
            : undefined;

        const offset = (page - 1) * limit;

        const [items, totalResult] = await Promise.all([
            this.db.query.events.findMany({
                where,
                columns: eventListColumns,
                with: eventRelations,
                limit,
                offset,
                orderBy: [events.startsAt],
            }),

            this.db
                .select({ total: count() })
                .from(events)
                .where(where),
        ]);

        const totalItems = totalResult[0].total;

        return createPaginatedResult(items, { page, limit, totalItems })
    }

    async update(organizerId: string, eventId: string, data: UpdateEventData) {
        const [event] = await this.db
            .update(events)
            .set(data)
            .where(and(eq(events.organizerId, organizerId), eq(events.id, eventId)))
            .returning({
                id: events.id,
                title: events.title,
                description: events.description,
                organizerId: events.organizerId,
                venueId: events.venueId,
                startsAt: events.startsAt,
                endsAt: events.endsAt,
                bookingOpensAt: events.bookingOpensAt,
                bookingClosesAt: events.bookingClosesAt,
            })

        return event;
    }

    async findMetadataById(eventId: string) {
        return this.db.query.events.findFirst({
            columns: {
                id: true,
                status: true,
                organizerId: true,
            },
            where: eq(events.id, eventId),
        });
    }

    async delete(organizerId: string, eventId: string) {
        const [event] = await this.db
            .delete(events)
            .where(
                and(
                    eq(events.organizerId, organizerId),
                    eq(events.id, eventId),
                    inArray(events.status, [
                        EventStatus.DRAFT,
                        EventStatus.CANCELLED,
                    ]),
                ))
            .returning({
                id: events.id
            })

        return event;
    }

    async changeStatus(
        organizerId: string,
        eventId: string,
        status: EventStatus,
        allowedStatuses: EventStatus[],
    ) {
        const [event] = await this.db
            .update(events)
            .set({ status })
            .where(
                and(
                    eq(events.organizerId, organizerId),
                    eq(events.id, eventId),
                    inArray(events.status, allowedStatuses),
                ),
            )
            .returning({
                id: events.id,
                status: events.status,
            })

        return event;
    }


    async findSeats(eventId: string) {
        return await this.db.query.eventSeats.findMany({
            where: eq(eventSeats.eventId, eventId),
        });
    }
}