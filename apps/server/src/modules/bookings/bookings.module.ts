import { forwardRef, Module } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsController, EventBookingsController } from './bookings.controller';
import { BookingsRepository } from './bookings.repository';
import { EventsModule } from '../events/events.module';
import { ReservationsModule } from '../reservations/reservations.module';

@Module({
  controllers: [BookingsController, EventBookingsController],
  providers: [BookingsService, BookingsRepository],
  exports: [BookingsRepository],
  imports: [forwardRef(() => EventsModule), ReservationsModule],
})
export class BookingsModule { }
