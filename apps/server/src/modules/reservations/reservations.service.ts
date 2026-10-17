import { Injectable } from '@nestjs/common';

import { ReservationsRepository } from './reservations.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
    private readonly RESERVATION_DURATION = 10 * 60 * 1000; // 10 mins

    constructor(
        private readonly reservationsRepository: ReservationsRepository
    ) { }

    async reserve(
        userId: string,
        dto: CreateReservationDto
    ) {
        const expiresAt = new Date(Date.now() + this.RESERVATION_DURATION);

        const reservation = await this.reservationsRepository.create({
            seatId: dto.seatId,
            userId,
            expiresAt
        });

        return reservation;
    }
}
