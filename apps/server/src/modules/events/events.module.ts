import { forwardRef, Module } from '@nestjs/common';
import { EventsService } from './events.service';
import { EventsController } from './events.controller';
import { EventsRepository } from './events.repository';
import { BookingsModule } from '../bookings/bookings.module';

@Module({
  controllers: [EventsController],
  providers: [EventsService, EventsRepository],
  imports: [forwardRef(() => BookingsModule)],
  exports: [EventsRepository],
})
export class EventsModule { }
