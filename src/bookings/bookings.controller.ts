import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import type { Booking } from './booking.entity.js';
import { BookingsService } from './bookings.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';
import type { PatchBookingDto } from './dto/patch-booking.dto.js';
import type { UpdateBookingDto } from './dto/update-booking.dto.js';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  getAllBookings(): Booking[] {
    return this.bookingsService.getAllBookings();
  }

  @Get(':id')
  getBookingById(@Param('id') id: string): Booking {
    return this.bookingsService.getBookingById(id);
  }

  @Post()
  createBooking(@Body() dto: Partial<CreateBookingDto>): Booking {
    return this.bookingsService.createBooking(dto);
  }

  @Put(':id')
  updateBooking(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateBookingDto>,
  ): Booking {
    return this.bookingsService.updateBooking(id, dto);
  }

  @Patch(':id')
  patchBooking(@Param('id') id: string, @Body() dto: PatchBookingDto): Booking {
    return this.bookingsService.patchBooking(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBooking(@Param('id') id: string): void {
    this.bookingsService.deleteBooking(id);
  }
}
