import { Inject, Injectable } from "@nestjs/common";
import { eq, and, sql } from "drizzle-orm";

import { DRIZZLE } from "src/database/database.constants";
import type { DrizzleDb } from "src/database/database.types";
import { reservations } from "src/database/schema";
import { CreateReservationData } from "./reservations.types";

@Injectable()
export class ReservationsRepository {

    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDb,
    ) { }

    async reserve(data: CreateReservationData) {
        const [reservation] = await this.db
            .insert(reservations)
            .values(data)
            .onConflictDoUpdate({
                target: reservations.seatId,
                set: {
                    userId: data.userId,
                    expiresAt: data.expiresAt,
                    createdAt: sql`now()`,
                },
                // Reuse the row only when its existing reservation has expired.
                setWhere: sql`${reservations.expiresAt} <= now()`,
            })
            .returning({
                id: reservations.id,
                seatId: reservations.seatId,
                userId: reservations.userId,
                expiresAt: reservations.expiresAt,
            });

        // Undefined means a conflicting reservation is still active.
        return reservation;
    }


    async findById(userId: string, id: string) {
        return this.db.query.reservations.findFirst({
            where: and(
                eq(reservations.id, id),
                eq(reservations.userId, userId)
            ),
            columns: {
                id: true,
                seatId: true,
                userId: true,
                expiresAt: true,
            }
        });
    }

    async findBySeatId(seatId: string) {
        return this.db.query.reservations.findFirst({
            where: eq(reservations.seatId, seatId),
            columns: {
                id: true,
                seatId: true,
                userId: true,
                expiresAt: true,
            }
        });
    }

    async findMany(userId: string) {
        return this.db.query.reservations.findMany({
            where: eq(reservations.userId, userId),
            columns: {
                id: true,
                seatId: true,
                userId: true,
                expiresAt: true,
            }
        });
    }

    async delete(userId: string, reservationId: string) {
        const [deleted] = await this.db.delete(reservations)
            .where(
                and(
                    eq(reservations.id, reservationId),
                    eq(reservations.userId, userId)
                ))
            .returning({
                id: reservations.id,
                seatId: reservations.seatId,
            });

        return deleted;
    }
}