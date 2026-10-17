import {
  Controller,
  Post,
  UseGuards,
  Body,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  Patch,
  Delete
} from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { type AuthenticatedUser } from '../auth/auth.types';

import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';
import { UpdateEventsDto } from './dto/update-events.dto';
import { CreateEventSeatsDto } from './dto/create-event-seats.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  createEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateEventDto
  ) {
    return this.eventsService.createEvent(user.id, dto);
  }

  @Get(':eventId')
  getAnEvent(
    @Param('eventId', new ParseUUIDPipe()) eventId: string
  ) {
    return this.eventsService.getAnEvent(eventId);
  }

  @Get()
  getEvents(@Query() query: FindEventsDto) {
    return this.eventsService.getEvents(query);
  }

  @Patch(':eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  updateEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Body() dto: UpdateEventsDto
  ) {
    return this.eventsService.updateEvent(user.id, eventId, dto);
  }

  @Delete(':eventId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  deleteEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId', new ParseUUIDPipe()) eventId: string
  ) {
    return this.eventsService.deleteEvent(user.id, eventId);
  }

  @Post(':eventId/publish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  publishEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId', new ParseUUIDPipe()) eventId: string
  ) {
    return this.eventsService.publishEvent(user.id, eventId);
  }

  @Post(':eventId/unpublish')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  unpublishEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId', new ParseUUIDPipe()) eventId: string
  ) {
    return this.eventsService.unpublishEvent(user.id, eventId);
  }

  @Post(':eventId/cancel')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  cancelEvent(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId', new ParseUUIDPipe()) eventId: string
  ) {
    return this.eventsService.cancelEvent(user.id, eventId);
  }

  @Get(':eventId/seats')
  getEventSeats(
    @Param('eventId', new ParseUUIDPipe()) eventId: string
  ) {
    return this.eventsService.getEventSeats(eventId);
  }

  @Post(':eventId/seats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  createEventSeats(
    @CurrentUser() user: AuthenticatedUser,
    @Param('eventId', new ParseUUIDPipe()) eventId: string,
    @Body() dto: CreateEventSeatsDto
  ) {
    return this.eventsService.createEventSeats(user.id, eventId, dto);
  }
}
