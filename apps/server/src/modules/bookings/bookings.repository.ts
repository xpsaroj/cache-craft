import { Inject, Injectable } from '@nestjs/common';
import { eq, and, inArray } from 'drizzle-orm';

import { DRIZZLE } from 'src/database/database.constants';
import type { DrizzleDb } from 'src/database/database.types';
import { bookings, bookingItems } from 'src/database/schema';
import { BookingStatus } from 'src/database/schema';
import { createPaginatedResult } from "src/common/utils/create-paginated-result";
import type { CreateBookingData } from './bookings.types';

@Injectable()
export class BookingsRepository {
    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDb,
    ) { }

    async create(data: CreateBookingData) {
        return this.db.transaction(async (tx) => {
            const [booking] = await tx
                .insert(bookings)
                .values({
                    eventId: data.eventId,
                    userId: data.userId,
                    totalPrice: data.totalPrice,
                })
                .returning({
                    id: bookings.id,
                    eventId: bookings.eventId,
                    userId: bookings.userId,
                    status: bookings.status,
                    totalPrice: bookings.totalPrice,
                });

            const items = await tx
                .insert(bookingItems)
                .values(
                    data.seats.map((seat) => ({
                        bookingId: booking.id,
                        seatId: seat.seatId,
                        price: seat.price,
                    })),
                )
                .returning({
                    id: bookingItems.id,
                    bookingId: bookingItems.bookingId,
                    seatId: bookingItems.seatId,
                    price: bookingItems.price,
                });

            return {
                ...booking,
                items,
            };
        });
    }

    async findById(userId: string, bookingId: string) {
        return this.db.query.bookings.findFirst({
            where: and(
                eq(bookings.id, bookingId),
                eq(bookings.userId, userId)
            ),
            columns: {
                id: true,
                eventId: true,
                userId: true,
                status: true,
                totalPrice: true,
            },
        });
    }

    async findByUserId(userId: string) {
        return this.db.query.bookings.findMany({
            where: eq(bookings.userId, userId),
            columns: {
                id: true,
                eventId: true,
                userId: true,
                status: true,
                totalPrice: true,
            },
        });
    }

    async findByEventId(eventId: string) {
        return this.db.query.bookings.findFirst({
            where: eq(bookings.eventId, eventId),
            columns: {
                id: true,
                eventId: true,
                userId: true,
                status: true,
                totalPrice: true,
            },
        });
    }

    async changeStatus(userId: string, bookingId: string, status: BookingStatus, allowedStatuses: BookingStatus[]) {
        const [booking] = await this.db
            .update(bookings)
            .set({ status })
            .where(
                and(
                    eq(bookings.userId, userId),
                    eq(bookings.id, bookingId),
                    inArray(bookings.status, allowedStatuses),
                ),
            )
            .returning({
                id: bookings.id,
                status: bookings.status,
            })

        return booking;
    }
}