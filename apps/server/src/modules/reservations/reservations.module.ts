import { forwardRef, Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { ReservationsRepository } from './reservations.repository';
import { EventsModule } from '../events/events.module';

@Module({
  controllers: [ReservationsController],
  providers: [ReservationsService, ReservationsRepository],
  imports: [forwardRef(() => EventsModule)],
  exports: [ReservationsRepository]
})
export class ReservationsModule {}
