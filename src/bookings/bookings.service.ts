import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { PatchBookingDto, UpdateBookingDto } from './dto/update-booking.dto.js';
import { ServicesService } from '../services/services.service.js';
import { error } from 'console';
import { NotFoundError } from 'rxjs';
import { Booking } from './entities/booking.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { parseIdString } from '../utils.js';

@Injectable()
export class BookingsService {
  constructor (@InjectRepository(Booking) private bookingsRepository: Repository<Booking>, private servicesService: ServicesService) {}

  private convertToBookingResponse(booking: Booking) {
    return {
      id: 'bkg_' + String(booking.id).padStart(3, "0"),
      serviceId: booking.serviceId,
      date: booking.date,
      timeSlot: booking.timeSlot,
      customerId: booking.customerId,
      status: booking.status
    }
  }

  async create(createBookingDto: CreateBookingDto, customerId: number) {
    await this.servicesService.findOne(createBookingDto.serviceId)
    const booking: Booking = this.bookingsRepository.create({
      serviceId: createBookingDto.serviceId,
      date: createBookingDto.date,
      timeSlot: createBookingDto.timeSlot,
      customerId: customerId,
      status: "PENDING"
    });
    return this.convertToBookingResponse(await this.bookingsRepository.save(booking));
  }

  async findAll(userId: number) {
    return (await this.bookingsRepository.findBy({customerId: userId})).map((value) => this.convertToBookingResponse(value));
  }

  async findOne(id: string, userId: number) {
    const booking = await this.bookingsRepository.findOneBy({id: parseIdString(id)})
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    if (booking.customerId !== userId)
      throw new ForbiddenException();
    return booking;
  }

  async findById(id: string, userId: number) {
    const booking = await this.findOne(id, userId);
    return this.convertToBookingResponse(booking);
  }

  async update(id: string, updateBookingDto: UpdateBookingDto, userId: number) {
    const booking = await this.findOne(id, userId);
    await this.servicesService.findOne(updateBookingDto.serviceId)
    booking.serviceId = updateBookingDto.serviceId;
    booking.date = updateBookingDto.date;
    booking.timeSlot = updateBookingDto.timeSlot;
    return this.convertToBookingResponse(await this.bookingsRepository.save(booking));
  }

  async patch(id: string, patchBookingDto: PatchBookingDto, userId: number) {
    const booking = await this.findOne(id, userId);
    if (!Object.values(patchBookingDto).some((value) => value !== undefined)) 
      throw new BadRequestException("At least one of serviceId, date, timeSlot, customerName is required");
    if (patchBookingDto.serviceId !== undefined) 
      await this.servicesService.findOne(patchBookingDto.serviceId)
    return this.convertToBookingResponse(await this.bookingsRepository.save(Object.assign(booking, patchBookingDto)));
  }

  async remove(id: string, userId: number) {
    await this.findOne(id, userId);
    await this.bookingsRepository.delete(id);
  }
}
