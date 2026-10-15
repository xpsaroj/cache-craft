import { Injectable } from '@nestjs/common';

import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { FindEventsFilters } from './events.types';

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
}
