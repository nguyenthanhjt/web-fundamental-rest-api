import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus, HttpCode } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { PatchBookingDto, UpdateBookingDto } from './dto/update-booking.dto.js';

@Controller('api/v1/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  create(@Body() createBookingDto: CreateBookingDto) {
    return this.bookingsService.create(createBookingDto);
  }

  @Get()
  findAll() {
    return this.bookingsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bookingsService.findOne(id);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return this.bookingsService.update(id, updateBookingDto);
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() patchBookingDto: PatchBookingDto) {
    return this.bookingsService.patch(id, patchBookingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  
  remove(@Param('id') id: string) {
    return this.bookingsService.remove(id);
  }
}
