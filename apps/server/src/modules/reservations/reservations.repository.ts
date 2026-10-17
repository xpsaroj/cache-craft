import { Inject, Injectable } from "@nestjs/common";
import { eq } from "drizzle-orm";

import { DRIZZLE } from "src/database/database.constants";
import type { DrizzleDb } from "src/database/database.types";
import { reservations } from "src/database/schema";
import { CreateReservationData } from "./reservations.types";

@Injectable()
export class ReservationsRepository {

    constructor(
        @Inject(DRIZZLE) private readonly db: DrizzleDb,
    ) { }

    async create(data: CreateReservationData) {
        const [reservation] = await this.db
            .insert(reservations)
            .values({
                ...data
            })
            .returning({
                id: reservations.id,
                seatId: reservations.seatId,
                userId: reservations.userId,
                expiresAt: reservations.expiresAt,
            });

        return reservation;
    }

    async findById(id: string) {
        const reservation = await this.db.query.reservations.findFirst({
            where: eq(reservations.id, id),
            columns: {
                id: true,
                seatId: true,
                userId: true,
                expiresAt: true,
            }
        });

        return reservation;
    }
}