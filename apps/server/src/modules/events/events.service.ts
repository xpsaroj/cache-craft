import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ConflictException,
    ForbiddenException,
} from '@nestjs/common';

import { EventStatus } from 'src/database/schema';
import { EventsRepository } from './events.repository';
import { BookingsRepository } from '../bookings/bookings.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventsDto } from './dto/update-events.dto';
import { CreateEventSeatsDto } from './dto/create-event-seats.dto';
import { FindEventsFilters, UpdateEventData } from './events.types';
import { validateEventDates } from './events.validation';

@Injectable()
export class EventsService {
    constructor(
        private readonly eventsRepository: EventsRepository,
        private readonly bookingsRepository: BookingsRepository,
    ) { }

    private requireEventOwnership<T extends { organizerId: string }>(
        event: T | undefined,
        organizerId: string,
    ): T {
        if (!event) {
            throw new NotFoundException('Event not found.');
        }

        if (event.organizerId !== organizerId) {
            throw new ForbiddenException(
                'You are not allowed to perform this action on this event.',
            );
        }

        return event;
    }

    private requireEventStatus(
        status: EventStatus,
        allowedStatuses: EventStatus[],
        action: string,
    ): void {
        if (!allowedStatuses.includes(status)) {
            throw new ConflictException(
                `Cannot ${action} an event with status ${status}.`,
            );
        }
    }

    async createEvent(organizerId: string, dto: CreateEventDto) {
        const dates = {
            startsAt: new Date(dto.startsAt),
            endsAt: new Date(dto.endsAt),
            bookingOpensAt: new Date(dto.bookingOpensAt),
            bookingClosesAt: new Date(dto.bookingClosesAt),
        };

        validateEventDates(dates);

        return this.eventsRepository.create({
            ...dto,
            ...dates,
            organizerId,
        });
    }

    async getAnEvent(eventId: string) {
        const event = await this.eventsRepository.findById(eventId);

        if (!event) {
            throw new NotFoundException('Event not found.');
        }

        return event;
    }

    async getEvents(dto: FindEventsDto) {
        const filters: FindEventsFilters = {
            page: dto.page,
            limit: dto.limit,
            ...(dto.title && { title: dto.title }),
            ...(dto.description && { description: dto.description }),
            ...(dto.startsAfter && {
                startsAfter: new Date(dto.startsAfter),
            }),
            ...(dto.endsBefore && {
                endsBefore: new Date(dto.endsBefore),
            }),
            ...(dto.status && { status: dto.status }),
            ...(dto.venueId && { venueId: dto.venueId }),
            ...(dto.organizerId && { organizerId: dto.organizerId }),
        };

        return this.eventsRepository.findMany(filters);
    }

    async updateEvent(
        organizerId: string,
        eventId: string,
        dto: UpdateEventsDto,
    ) {
        const metadata = this.requireEventOwnership(
            await this.eventsRepository.findMetadataById(eventId),
            organizerId,
        );

        this.requireEventStatus(
            metadata.status,
            [EventStatus.DRAFT, EventStatus.PUBLISHED],
            'update',
        );

        const dates = {
            startsAt: dto.startsAt
                ? new Date(dto.startsAt)
                : metadata.startsAt,
            endsAt: dto.endsAt
                ? new Date(dto.endsAt)
                : metadata.endsAt,
            bookingOpensAt: dto.bookingOpensAt
                ? new Date(dto.bookingOpensAt)
                : metadata.bookingOpensAt,
            bookingClosesAt: dto.bookingClosesAt
                ? new Date(dto.bookingClosesAt)
                : metadata.bookingClosesAt,
        };

        validateEventDates(dates);

        const data: UpdateEventData = {};

        if (dto.venueId !== undefined) data.venueId = dto.venueId;
        if (dto.title !== undefined) data.title = dto.title;
        if (dto.description !== undefined) data.description = dto.description;

        if (dto.startsAt !== undefined) data.startsAt = dates.startsAt;
        if (dto.endsAt !== undefined) data.endsAt = dates.endsAt;
        if (dto.bookingOpensAt !== undefined) {
            data.bookingOpensAt = dates.bookingOpensAt;
        }
        if (dto.bookingClosesAt !== undefined) {
            data.bookingClosesAt = dates.bookingClosesAt;
        }

        if (Object.keys(data).length === 0) {
            throw new BadRequestException(
                'At least one field must be provided for an update.',
            );
        }

        const updatedEvent = await this.eventsRepository.update(
            organizerId,
            eventId,
            data,
        );

        if (!updatedEvent) {
            return this.handleEventMutationFailure(
                organizerId,
                eventId,
                'update',
            );
        }

        return updatedEvent;
    }

    async deleteEvent(organizerId: string, eventId: string) {
        const booking = await this.bookingsRepository.findByEventId(eventId);

        if (booking) {
            throw new ConflictException(
                'Cannot delete an event with existing bookings.',
            );
        }

        const event = await this.eventsRepository.delete(organizerId, eventId);

        if (event) {
            return {
                id: event.id,
                deleted: true,
            };
        }

        return this.handleEventMutationFailure(organizerId, eventId, 'delete');
    }

    async publishEvent(organizerId: string, eventId: string) {
        const event = await this.eventsRepository.changeStatus(
            organizerId,
            eventId,
            EventStatus.PUBLISHED,
            [EventStatus.DRAFT],
        );

        if (event) return event;

        return this.handleEventMutationFailure(organizerId, eventId, 'publish');
    }

    async unpublishEvent(organizerId: string, eventId: string) {
        const booking = await this.bookingsRepository.findByEventId(eventId);

        if (booking) {
            throw new ConflictException(
                'Cannot unpublish an event with existing bookings.',
            );
        }

        const event = await this.eventsRepository.changeStatus(
            organizerId,
            eventId,
            EventStatus.DRAFT,
            [EventStatus.PUBLISHED],
        );

        if (event) return event;

        return this.handleEventMutationFailure(organizerId, eventId, 'unpublish');
    }

    async cancelEvent(organizerId: string, eventId: string) {
        const booking = await this.bookingsRepository.findByEventId(eventId);

        if (booking) {
            throw new ConflictException(
                'Cannot cancel an event with existing bookings.',
            );
        }

        const event = await this.eventsRepository.changeStatus(
            organizerId,
            eventId,
            EventStatus.CANCELLED,
            [EventStatus.DRAFT, EventStatus.PUBLISHED],
        );

        if (event) return event;

        return this.handleEventMutationFailure(organizerId, eventId, 'cancel');
    }

    private async handleEventMutationFailure(
        organizerId: string,
        eventId: string,
        action: string,
    ): Promise<never> {
        const metadata = await this.eventsRepository.findMetadataById(eventId);

        if (!metadata) {
            throw new NotFoundException('Event not found');
        }

        if (metadata.organizerId !== organizerId) {
            throw new ForbiddenException(
                'You are not allowed to perform this action on this event',
            );
        }

        throw new ConflictException(
            `Cannot ${action} an event with status ${metadata.status}.`,
        );
    }

    async getEventSeats(eventId: string) {
        return this.eventsRepository.findSeats(eventId);
    }

    async createEventSeats(
        organizerId: string,
        eventId: string,
        dto: CreateEventSeatsDto
    ) {
        const event = this.requireEventOwnership(
            await this.eventsRepository.findMetadataById(eventId),
            organizerId,
        );

        this.requireEventStatus(
            event.status,
            [EventStatus.DRAFT],
            'create seats for',
        );
        const seats = dto.rows.flatMap(({ row, seatCount, price }) => {
            const normalizedRow = row.toUpperCase();

            return Array.from({ length: seatCount }, (_, index) => {
                const number = index + 1;

                return {
                    seatCode: `${normalizedRow}-${number}`,
                    row: normalizedRow,
                    number,
                    price: price.toString(),
                };
            });
        });

        return this.eventsRepository.createSeats(eventId, { seats });
    }
}
