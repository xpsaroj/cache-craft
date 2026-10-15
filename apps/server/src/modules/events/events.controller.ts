import { Controller, Post, UseGuards, Body, Get, Param, ParseUUIDPipe, Query } from '@nestjs/common';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

import { EventsService } from './events.service';
import { type AuthenticatedUser } from '../auth/auth.types';
import { CreateEventDto } from './dto/create-event.dto';
import { FindEventsDto } from './dto/find-events.dto';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) { }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ORGANIZER')
  createEvent(@CurrentUser() user: AuthenticatedUser, @Body() dto: CreateEventDto) {
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
}
