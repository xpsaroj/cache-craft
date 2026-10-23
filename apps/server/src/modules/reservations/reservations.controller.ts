import {
  Controller,
  Post,
  Body,
  Get,
  Delete,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';

import { ReservationsService } from './reservations.service';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService
  ) { }

  @Get('/me')
  @UseGuards(JwtAuthGuard)
  getReservations(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.reservationsService.getReservations(user.id);
  }

  @Get(':reservationId')
  @UseGuards(JwtAuthGuard)
  getReservation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('reservationId') reservationId: string,
  ) {
    return this.reservationsService.getReservation(user.id, reservationId);
  }

  @Delete(':reservationId')
  @UseGuards(JwtAuthGuard)
  deleteReservation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('reservationId') reservationId: string,
  ) {
    return this.reservationsService.deleteReservation(user.id, reservationId);
  }
}

@Controller('events/:eventId/reservations')
export class EventReservationsController {
  constructor(
    private readonly reservationsService: ReservationsService,
  ) { }

  @Post()
  create(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateReservationDto,
  ) {
    return this.reservationsService.reserveASeat(eventId, user.id, dto);
  }
}