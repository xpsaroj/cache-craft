export interface CreateBookingData {
    eventId: string;
    userId: string;
    totalPrice: string;
    seats: {
        seatId: string;
        price: string;
    }[];
}