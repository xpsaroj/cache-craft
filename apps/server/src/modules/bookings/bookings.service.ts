import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ConflictException,
} from '@nestjs/common';

import { BookingsRepository } from './bookings.repository';
import { EventsRepository } from '../events/events.repository';
import { EventStatus } from 'src/database/schema';
import { ReservationsRepository } from '../reservations/reservations.repository';
import { CreateBookingDto } from './dto/creat-booking.dto';
import { BookingStatus } from 'src/database/schema';

@Injectable()
export class BookingsService {
    constructor(
        private readonly bookingsRepository: BookingsRepository,
        private readonly eventsRepository: EventsRepository,
        private readonly reservationsRepository: ReservationsRepository,
    ) { }

    async createBooking(
        eventId: string,
        userId: string,
        dto: CreateBookingDto,
    ) {
        const event = await this.eventsRepository.findById(eventId);

        if (!event || event.status === EventStatus.DRAFT) {
            throw new NotFoundException('Event not found.');
        }

        if (event.status !== EventStatus.PUBLISHED) {
            throw new ConflictException(`Cannot book a seat for an event with status ${event.status}`);
        }

        const seats = await this.eventsRepository.findSeatsByIds(
            eventId,
            dto.seatIds,
        );

        if (seats.length !== new Set(dto.seatIds).size) {
            throw new BadRequestException(
                'One or more seats are invalid for this event.',
            );
        }

        const reservations =
            await this.reservationsRepository.findActiveByUserAndSeats(
                userId,
                dto.seatIds,
            );

        if (reservations.length !== new Set(dto.seatIds).size) {
            throw new ConflictException(
                'One or more seats are not actively reserved by you.',
            );
        }

        const totalPrice = seats.reduce(
            (total, seat) => total + Number(seat.price),
            0,
        );

        return this.bookingsRepository.create({
            eventId,
            userId,
            totalPrice: totalPrice.toFixed(2),
            seats: seats.map((seat) => ({
                seatId: seat.id,
                price: seat.price,
            })),
        });
    }

    async getAllBookings(userId: string) {
        return this.bookingsRepository.findByUserId(userId);
    }

    async getBookingById(userId: string, bookingId: string) {
        const booking = await this.bookingsRepository.findById(userId, bookingId);

        if (!booking) {
            throw new BadRequestException('Booking not found.');
        }

        return booking;
    }

    async cancelBooking(userId: string, bookingId: string) {
        const booking = await this.bookingsRepository.changeStatus(
            userId,
            bookingId,
            BookingStatus.CANCELLED,
            [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        );

        if (!booking) {
            throw new BadRequestException(
                'Booking not found or cannot be cancelled.',
            );
        }

        return booking;
    }
}
