import { BadRequestException } from '@nestjs/common';

interface EventDates {
    startsAt: Date;
    endsAt: Date;
    bookingOpensAt: Date;
    bookingClosesAt: Date;
}

export function validateEventDates(dates: EventDates): void {
    const {
        startsAt,
        endsAt,
        bookingOpensAt,
        bookingClosesAt,
    } = dates;

    if (startsAt >= endsAt) {
        throw new BadRequestException(
            'Event start time must be before its end time.',
        );
    }

    if (bookingOpensAt >= bookingClosesAt) {
        throw new BadRequestException(
            'Booking opening time must be before booking closing time.',
        );
    }

    if (bookingClosesAt > startsAt) {
        throw new BadRequestException(
            'Booking must close before or at the event start time.',
        );
    }
}