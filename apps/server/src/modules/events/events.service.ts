import {
    Injectable,
    BadRequestException,
    NotFoundException,
    ConflictException,
    ForbiddenException,
    InternalServerErrorException
} from '@nestjs/common';

import { EventStatus } from 'src/database/schema';
import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventsDto } from './dto/update-events.dto';
import { CreateEventSeatsDto } from './dto/create-event-seats.dto';
import { FindEventsFilters, UpdateEventData } from './events.types';

@Injectable()
export class EventsService {
    constructor(
        private readonly eventsRepository: EventsRepository
    ) { }

    async createEvent(organizerId: string, dto: CreateEventDto) {
        const eventData = {
            ...dto,
            organizerId,
            startsAt: new Date(dto.startsAt),
            endsAt: new Date(dto.endsAt),
            bookingOpensAt: new Date(dto.bookingOpensAt),
            bookingClosesAt: new Date(dto.bookingClosesAt),
        }

        return this.eventsRepository.create(eventData);
    }

    async getAnEvent(eventId: string) {
        return this.eventsRepository.findById(eventId);
    }

    async getEvents(dto: FindEventsDto) {
        const filters: FindEventsFilters = {
            page: dto.page,
            limit: dto.limit,
        }

        if (dto.title) filters.title = dto.title;
        if (dto.description) filters.description = dto.description;
        if (dto.startsAfter) filters.startsAfter = new Date(dto.startsAfter);
        if (dto.endsBefore) filters.endsBefore = new Date(dto.endsBefore);
        if (dto.status) filters.status = dto.status;
        if (dto.venueId) filters.venueId = dto.venueId;
        if (dto.organizerId) filters.organizerId = dto.organizerId;

        return this.eventsRepository.findMany(filters);
    }

    async updateEvent(organizerId: string, eventId: string, dto: UpdateEventsDto) {
        const updateData: UpdateEventData = {}

        if (dto.venueId) updateData.venueId = dto.venueId;
        if (dto.title) updateData.title = dto.title;
        if (dto.description) updateData.description = dto.description;
        if (dto.startsAt) updateData.startsAt = new Date(dto.startsAt);
        if (dto.endsAt) updateData.endsAt = new Date(dto.endsAt);
        if (dto.bookingOpensAt) updateData.bookingOpensAt = new Date(dto.bookingOpensAt);
        if (dto.bookingClosesAt) updateData.bookingClosesAt = new Date(dto.bookingClosesAt);

        if (Object.keys(updateData).length === 0) {
            throw new BadRequestException('No valid fields provided for update');
        }

        const event = await this.eventsRepository.update(organizerId, eventId, updateData);

        if (event) {
            return event;
        }

        const metadata = await this.eventsRepository.findMetadataById(eventId);

        if (!metadata) {
            throw new NotFoundException('Event not found');
        }

        if (metadata.organizerId !== organizerId) {
            throw new ForbiddenException(
                'You are not allowed to perform this action on this event',
            );
        }

        // Defensive fallback: the update matched no row for an
        // unexpected reason, so don't silently return undefined.
        throw new InternalServerErrorException(
            'Failed to update the event.',
        );
    }

    async deleteEvent(organizerId: string, eventId: string) {
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
        const event = await this.eventsRepository.findMetadataById(eventId);

        if (!event) {
            throw new NotFoundException('Event not found');
        }

        if (event.organizerId !== organizerId) {
            throw new ForbiddenException(
                'You are not allowed to perform this action on this event',
            );
        }

        if (event.status !== EventStatus.DRAFT) {
            throw new ConflictException(
                `Cannot create seats for an event with status ${event.status}.`,
            );
        }

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
