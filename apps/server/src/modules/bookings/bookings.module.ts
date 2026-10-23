import { Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController, EventBookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';

@Module({
  controllers: [BookingsController, EventBookingsController],
  providers: [BookingsService, BookingsRepository],
})
export class BookingsModule {}
