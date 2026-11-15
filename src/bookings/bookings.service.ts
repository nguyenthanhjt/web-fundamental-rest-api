import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { PatchBookingDto, UpdateBookingDto } from './dto/update-booking.dto.js';
import { BookingsRepository } from './bookings.repository.js';
import { ServicesService } from '../services/services.service.js';
import { error } from 'console';
import { NotFoundError } from 'rxjs';
import { Booking } from './entities/booking.entity.js';

@Injectable()
export class BookingsService {
  constructor (private bookingsRepository: BookingsRepository, private servicesService: ServicesService) {}

  private nextBookingNumber: number = 1;

  create(createBookingDto: CreateBookingDto) {
    this.servicesService.findOne(createBookingDto.serviceId)
    const booking: Booking = {
      id: "bkg_" + String(this.nextBookingNumber).padStart(3, "0"),
      serviceId: createBookingDto.serviceId,
      date: createBookingDto.date,
      timeSlot: createBookingDto.timeSlot,
      customerName: createBookingDto.customerName,
      status: "PENDING"
    };
    this.nextBookingNumber++;
    return this.bookingsRepository.save(booking);
  }

  findAll() {
    return this.bookingsRepository.findAll();
  }

  findOne(id: string) {
    const booking = this.bookingsRepository.findById(id)
    if (!booking) {
      throw new NotFoundException("Booking not found");
    }
    return booking;
  }

  update(id: string, updateBookingDto: UpdateBookingDto) {
    const booking = this.findOne(id);
    this.servicesService.findOne(updateBookingDto.serviceId)
    booking.serviceId = updateBookingDto.serviceId;
    booking.date = updateBookingDto.date;
    booking.timeSlot = updateBookingDto.timeSlot;
    booking.customerName = updateBookingDto.customerName;
    return this.bookingsRepository.save(booking);
  }

  patch(id: string, patchBookingDto: PatchBookingDto) {
    const booking = this.findOne(id);
    if (!Object.values(patchBookingDto).some((value) => value !== undefined)) 
      throw new BadRequestException("At least one of serviceId, date, timeSlot, customerName is required");
    if (patchBookingDto.serviceId !== undefined) 
      this.servicesService.findOne(patchBookingDto.serviceId)
    return this.bookingsRepository.save(Object.assign(booking, patchBookingDto));
  }

  remove(id: string) {
    this.findOne(id);
    return this.bookingsRepository.delete(id);
  }
}
