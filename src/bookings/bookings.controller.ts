import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { BookingInput } from './booking.input.js';
import { UpdateBookingInput } from './updateBookingInput.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';

@Controller('api/v1/bookings')
export class BookingsController {
  constructor(private readonly bookingService: BookingsService) {}

  @Get()
  findAll(@CurrentUser() user: AuthenticatedUser) { return this.bookingService.findAll(user); }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingService.findById(id, user);
  }

  @Post()
  create(@Body() body: BookingInput, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingService.create(body, user);
  }

  @Put(':id')
  replace(@Param('id') id: string, @Body() body: BookingInput, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingService.replace(id, body, user);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: UpdateBookingInput, @CurrentUser() user: AuthenticatedUser) {
    return this.bookingService.update(id, body, user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    this.bookingService.delete(id, user);
  }
}
