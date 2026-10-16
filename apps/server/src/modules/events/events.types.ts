import { EventStatus } from "src/database/schema";

export interface CreateEventData {
    organizerId: string;
    venueId: string;
    title: string;
    description?: string;
    startsAt: Date;
    endsAt: Date;
    bookingOpensAt: Date;
    bookingClosesAt: Date;
}

export interface FindEventsFilters {
    title?: string;
    description?: string;
    startsAfter?: Date;
    endsBefore?: Date;
    status?: EventStatus;
    venueId?: string;
    organizerId?: string;
    page?: number;
    limit?: number;
}

export interface UpdateEventData extends
Omit<Partial<CreateEventData>, 'organizerId'> { };