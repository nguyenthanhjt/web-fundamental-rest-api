import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus, HttpCode } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { PatchBookingDto, UpdateBookingDto } from './dto/update-booking.dto.js';

@Controller('api/v1/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto) {
    return await this.bookingsService.create(createBookingDto);
  }

  @Get()
  async findAll() {
    return await this.bookingsService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.bookingsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto) {
    return await this.bookingsService.update(id, updateBookingDto);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() patchBookingDto: PatchBookingDto) {
    return await this.bookingsService.patch(id, patchBookingDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  
  async remove(@Param('id') id: string) {
    await this.bookingsService.remove(id);
  }
}
