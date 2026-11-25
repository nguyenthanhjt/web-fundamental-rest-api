import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { ChangeBookingStatusDto } from './dto/change-booking-status.dto';
import { Can } from '@nestjs/authorization';
import { BookingPolicy } from './bookings.policy';
import { CurrentUser } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity';
@Controller('bookings')
export class BookingsController {
  constructor(private readonly bookings: BookingsService) {}

  @Get()
  @Can(BookingPolicy, 'viewAll')
  findAll() { return this.bookings.findAll(); }

  @Get('me')
  @Can(BookingPolicy, 'viewMine')
  findMine(@CurrentUser() user: User) { return this.bookings.findMine(user.id); }

  @Get(':id')
  @Can(BookingPolicy, 'view', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  findOne(@Param('id', ParseIntPipe) id: number) { return this.bookings.findOne(id); }

  @Patch(':id/status')
  @Can(BookingPolicy, 'changeStatus')
  changeStatus(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangeBookingStatusDto) {
    return this.bookings.changeStatus(id, dto.status);
  }

  @Post()
   @Can(BookingPolicy, 'create')
  create(@Body() dto: CreateBookingDto, @CurrentUser() user: User) {
    return this.bookings.create(dto, user.id);
  }

  @Put(':id')
  @Can(BookingPolicy, 'update', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateBookingDto) {
    return this.bookings.replace(id, dto);
  }

  @Patch(':id')
  @Can(BookingPolicy, 'update', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBookingDto) {
    return this.bookings.update(id, dto);
  }

  @Delete(':id')
  @Can(BookingPolicy, 'remove', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) { return this.bookings.remove(id); }
}
