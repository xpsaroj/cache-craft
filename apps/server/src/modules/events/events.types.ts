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