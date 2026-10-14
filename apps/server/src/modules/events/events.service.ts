import { Injectable } from '@nestjs/common';

import { EventsRepository } from './events.repository';
import { CreateEventDto } from './dto/create-event.dto';

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
}
