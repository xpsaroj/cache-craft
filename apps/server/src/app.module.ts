import { Module } from '@nestjs/common';
import { ConfigModule } from "@nestjs/config";

import { resolveEnvFilePath, validate } from "./config/env.validation";
import configuration from './config/configuration';
import { DatabaseModule } from "./database/database.module";
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { EventsModule } from './modules/events/events.module';
import { ReservationsModule } from './modules/reservations/reservations.module';
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: resolveEnvFilePath(),
      validate,
      load: [configuration]
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    EventsModule,
    ReservationsModule,
    BookingsModule,
  ],
})
export class AppModule { }
