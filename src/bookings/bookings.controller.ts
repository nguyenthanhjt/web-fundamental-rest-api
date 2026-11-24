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
  Request,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator.js';
import type SecuredUser from '../auth/entities/secured-user.entity.js';
import type { Booking } from './booking.entity.js';
import { BookingsService } from './bookings.service.js';
import type { CreateBookingDto } from './dto/create-booking.dto.js';
import type { PatchBookingDto } from './dto/patch-booking.dto.js';
import type { UpdateBookingDto } from './dto/update-booking.dto.js';

@Auth('USER', 'ADMIN')
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  getAllBookings(@Request() req: { user: SecuredUser }): Booking[] {
    return this.bookingsService.getAllBookings(req.user);
  }

  @Get(':id')
  getBookingById(
    @Param('id') id: string,
    @Request() req: { user: SecuredUser },
  ): Booking {
    return this.bookingsService.getBookingById(id, req.user);
  }

  @Post()
  createBooking(
    @Body() dto: Partial<CreateBookingDto>,
    @Request() req: { user: SecuredUser },
  ): Booking {
    return this.bookingsService.createBooking(dto, req.user);
  }

  @Put(':id')
  updateBooking(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateBookingDto>,
    @Request() req: { user: SecuredUser },
  ): Booking {
    return this.bookingsService.updateBooking(id, dto, req.user);
  }

  @Patch(':id')
  patchBooking(
    @Param('id') id: string,
    @Body() dto: PatchBookingDto,
    @Request() req: { user: SecuredUser },
  ): Booking {
    return this.bookingsService.patchBooking(id, dto, req.user);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteBooking(
    @Param('id') id: string,
    @Request() req: { user: SecuredUser },
  ): void {
    this.bookingsService.deleteBooking(id, req.user);
  }
}
