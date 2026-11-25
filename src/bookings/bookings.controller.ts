import {
  Body,
  BadRequestException,
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
import { Can } from '@nestjs/authorization';
import { BookingPolicy } from '../auth/policies';
import { Booking } from './booking.model';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Get()
  @Can(BookingPolicy, 'access')
  findAll(): Booking[] {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  @Can(BookingPolicy, 'access')
  findOne(@Param('id') id: string): Booking {
    return this.bookingsService.findOne(id);
  }

  @Post()
  @Can(BookingPolicy, 'access')
  create(@Body() body: CreateBookingDto): Booking {
    return this.bookingsService.create(body);
  }

  @Put(':id')
  @Can(BookingPolicy, 'access')
  replace(
    @Param('id') id: string,
    @Body() body: CreateBookingDto,
  ): Booking {
    return this.bookingsService.replace(id, body);
  }

  @Patch(':id')
  @Can(BookingPolicy, 'access')
  update(
    @Param('id') id: string,
    @Body() body: UpdateBookingDto,
  ): Booking {
    if (
      body.serviceId === undefined &&
      body.date === undefined &&
      body.timeSlot === undefined &&
      body.customerName === undefined
    ) {
      throw new BadRequestException('At least one booking field is required');
    }
    return this.bookingsService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Can(BookingPolicy, 'delete')
  remove(@Param('id') id: string): void {
    this.bookingsService.remove(id);
  }
}
