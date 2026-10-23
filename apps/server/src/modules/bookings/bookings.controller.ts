import {
  Controller,
  Post,
  UseGuards,
  Body,
  Param,
  ParseUUIDPipe,
  Get,
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/auth.types';

import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/creat-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService
  ) { }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getBookingsForEvent(
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.bookingsService.getAllBookings(user.id);
  }

  @Get(':bookingId')
  @UseGuards(JwtAuthGuard)
  async getBookingById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.bookingsService.getBookingById(user.id, bookingId);
  }

  @Post(':bookingId/cancel')
  @UseGuards(JwtAuthGuard)
  async cancelBooking(
    @CurrentUser() user: AuthenticatedUser,
    @Param('bookingId', ParseUUIDPipe) bookingId: string,
  ) {
    return this.bookingsService.cancelBooking(user.id, bookingId);
  }
}

@Controller('/events/:eventId/bookings')
export class EventBookingsController {
  constructor(
    private readonly bookingsService: BookingsService
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createBooking(
    @Param('eventId', ParseUUIDPipe) eventId: string,
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateBookingDto,
  ) {
    return this.bookingsService.createBooking(eventId, user.id, dto);
  }
}