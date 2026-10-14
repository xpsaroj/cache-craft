import { Injectable, Inject } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DRIZZLE } from "src/database/database.constants"
import type { DrizzleDb } from "src/database/database.types";
import { events } from "src/database/schema"
import { CreateEventData } from "./events.types";


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
            columns: {
                id: true,
                title: true,
                description: true,
                startsAt: true,
                endsAt: true,
                bookingOpensAt: true,
                bookingClosesAt: true,
            },
            with: {
                organizer: {
                    columns: {
                        id: true,
                        name: true,
                        email: true,
                    }
                },
                venue: {
                    columns: {
                        id: true,
                        name: true,
                        address: true,
                        city: true,
                        country: true,
                    }
                },
            }
        })
    }
}