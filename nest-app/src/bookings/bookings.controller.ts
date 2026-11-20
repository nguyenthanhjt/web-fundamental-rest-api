import { Controller, Body, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from '@nestjs/common';
import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import { CurrentUser, Public } from '@nestjs/authentication';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';

@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    @Get()
    @Public()
    findAll() {
        return this.bookingsService.findAll();
    }

    @Get(':id')
    @Public()
    findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(id);
    }

    @Post()
    create(@Body() createBookingDto: CreateBookingDto, @CurrentUser() user: AuthenticatedUser) {
        return this.bookingsService.create(createBookingDto, user.id);
    }

    @Put(':id')
    replace(@Param('id') id: string, @Body() body: CreateBookingDto, @CurrentUser() user: AuthenticatedUser) {
        return this.bookingsService.replace(id, body, user);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() body: UpdateBookingDto, @CurrentUser() user: AuthenticatedUser) {
        return this.bookingsService.update(id, body, user);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
        await this.bookingsService.remove(id, user);
    }
}
