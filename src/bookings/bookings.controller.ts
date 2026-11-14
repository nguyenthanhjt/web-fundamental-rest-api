import {Controller,Get,Param,Put,Post,Delete,HttpCode, HttpStatus,Body, Patch} from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import type { Booking } from './booking.interface.js';
import type { BookingInput } from './booking.input.js';
import type {UpdateBookingInput} from '../bookings/updateBookingInput.js'
@Controller('api/v1/bookings')
export class BookingsController {
  constructor(
    private readonly bookingService: BookingsService
  ) {}

  @Get()
  findAll(): Booking[] {
    return this.bookingService.findAll();
  }

  @Get(':id')
  findByOne(@Param('id') id: string): Booking {
    return this.bookingService.findById(id);
  }
  @Post()
  create(@Body() body: BookingInput): Booking {
    return this.bookingService.create(body);
  }

 
  @Put(':id')
  replace(
    @Param('id') id: string,
    @Body() body: BookingInput,
  ): Booking {
    return this.bookingService.replace(id, body);
  }

 
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateBookingInput,
  ): Booking {
    return this.bookingService.update(id, body);
  }

  
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string): void {
    this.bookingService.delete(id);
  }
}