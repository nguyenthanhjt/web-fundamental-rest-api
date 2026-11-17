import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
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
      customerName: booking.customerName,
      status: booking.status
    }
  }

  async create(createBookingDto: CreateBookingDto) {
    await this.servicesService.findOne(createBookingDto.serviceId)
    const booking: Booking = this.bookingsRepository.create({
      serviceId: createBookingDto.serviceId,
      date: createBookingDto.date,
      timeSlot: createBookingDto.timeSlot,
      customerName: createBookingDto.customerName,
      status: "PENDING"
    });
    return this.convertToBookingResponse(await this.bookingsRepository.save(booking));
  }

  async findAll() {
    return (await this.bookingsRepository.find()).map((value) => this.convertToBookingResponse(value));
  }

  async findOne(id: string) {
    const booking = await this.bookingsRepository.findOneBy({id: parseIdString(id)})
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }

  async findById(id: string) {
    return this.convertToBookingResponse(await this.findOne(id));
  }

  async update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = await this.findOne(id);
    await this.servicesService.findOne(updateBookingDto.serviceId)
    booking.serviceId = updateBookingDto.serviceId;
    booking.date = updateBookingDto.date;
    booking.timeSlot = updateBookingDto.timeSlot;
    booking.customerName = updateBookingDto.customerName;
    return this.convertToBookingResponse(await this.bookingsRepository.save(booking));
  }

  async patch(id: string, patchBookingDto: PatchBookingDto) {
    const booking = await this.findOne(id);
    if (!Object.values(patchBookingDto).some((value) => value !== undefined)) 
      throw new BadRequestException("At least one of serviceId, date, timeSlot, customerName is required");
    if (patchBookingDto.serviceId !== undefined) 
      await this.servicesService.findOne(patchBookingDto.serviceId)
    return this.convertToBookingResponse(await this.bookingsRepository.save(Object.assign(booking, patchBookingDto)));
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.bookingsRepository.delete(id);
  }
}
