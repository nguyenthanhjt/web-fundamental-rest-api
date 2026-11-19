import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpStatus, HttpCode } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { PatchBookingDto, UpdateBookingDto } from './dto/update-booking.dto.js';
import { CurrentUser } from '@nestjs/authentication';
import { User } from '../users/entity/users.entity.js';

@Controller('api/v1/bookings')
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.convertToBookingResponse(await this.bookingsService.create(createBookingDto, user.id));
  }

  @Get()
  async findAll(@CurrentUser() user: User) {
    return (await this.bookingsService.findAll(user.id)).map((value) => this.bookingsService.convertToBookingResponse(value));
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: User) {
    return this.bookingsService.convertToBookingResponse(await this.bookingsService.findOne(id, user.id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateBookingDto: UpdateBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.convertToBookingResponse(await this.bookingsService.update(id, updateBookingDto, user.id));
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() patchBookingDto: PatchBookingDto, @CurrentUser() user: User) {
    return this.bookingsService.convertToBookingResponse(await this.bookingsService.patch(id, patchBookingDto, user.id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)  
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.bookingsService.remove(id, user.id);
  }
}
