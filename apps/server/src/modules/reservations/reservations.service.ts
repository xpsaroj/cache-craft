import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';

import { ReservationsRepository } from './reservations.repository';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Injectable()
export class ReservationsService {
    private readonly RESERVATION_DURATION = 10 * 60 * 1000; // 10 mins

    constructor(
        private readonly reservationsRepository: ReservationsRepository
    ) { }

    async reserveASeat(userId: string, dto: CreateReservationDto) {
        const expiresAt = new Date(
            Date.now() + this.RESERVATION_DURATION,
        );

        const reservation = await this.reservationsRepository.reserve({
            seatId: dto.seatId,
            userId,
            expiresAt,
        });

        if (!reservation) {
            throw new ConflictException("Seat is already reserved");
        }

        return reservation;
    }


    async getReservation(userId: string, reservationId: string) {
        const reservation = await this.reservationsRepository.findById(userId, reservationId);

        if (!reservation) {
            throw new NotFoundException('Reservation not found');
        }

        return reservation;
    }

    async getReservations(userId: string) {
        const reservations = await this.reservationsRepository.findMany(userId);

        return reservations;
    }

    async deleteReservation(userId: string, reservationId: string) {
        const deletedReservation = await this.reservationsRepository.delete(userId, reservationId);

        if (!deletedReservation) {
            throw new NotFoundException('Reservation not found');
        }

        return {
            ...deletedReservation,
            deleted: true,
        };
    }
}
