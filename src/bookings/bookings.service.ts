import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';
import { Booking } from './booking.entity.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { PatchBookingDto } from './dto/patch-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

@Injectable()
export class BookingsService {
  private readonly bookings: Booking[] = [];
  private nextBookingNumber = 1;

  constructor(private readonly servicesService: ServicesService) {}

  getAllBookings(): Booking[] {
    return this.bookings;
  }

  getBookingById(id: string): Booking {
    const booking = this.bookings.find((item) => item.id === id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  createBooking(dto: Partial<CreateBookingDto>): Booking {
    const body = dto ?? {};
    if (
      !isNonEmptyString(body.serviceId) ||
      !isNonEmptyString(body.date) ||
      !isNonEmptyString(body.timeSlot) ||
      !isNonEmptyString(body.customerName)
    ) {
      throw new BadRequestException(
        'serviceId, date, timeSlot, customerName are required',
      );
    }

    this.servicesService.getServiceById(body.serviceId);

    const booking: Booking = {
      id: `bkg_${String(this.nextBookingNumber++).padStart(3, '0')}`,
      serviceId: body.serviceId,
      date: body.date,
      timeSlot: body.timeSlot,
      customerName: body.customerName,
      status: 'PENDING',
    };
    this.bookings.push(booking);
    return booking;
  }

  updateBooking(id: string, dto: Partial<UpdateBookingDto>): Booking {
    const booking = this.getBookingById(id);
    const body = dto ?? {};
    if (
      !isNonEmptyString(body.serviceId) ||
      !isNonEmptyString(body.date) ||
      !isNonEmptyString(body.timeSlot) ||
      !isNonEmptyString(body.customerName)
    ) {
      throw new BadRequestException(
        'serviceId, date, timeSlot, customerName are required',
      );
    }

    this.servicesService.getServiceById(body.serviceId);

    booking.serviceId = body.serviceId;
    booking.date = body.date;
    booking.timeSlot = body.timeSlot;
    booking.customerName = body.customerName;
    return booking;
  }

  patchBooking(id: string, dto: PatchBookingDto): Booking {
    const booking = this.getBookingById(id);
    const body = dto ?? {};

    if (
      body.serviceId === undefined &&
      body.date === undefined &&
      body.timeSlot === undefined &&
      body.customerName === undefined
    ) {
      throw new BadRequestException(
        'At least one of serviceId, date, timeSlot, customerName is required',
      );
    }

    if (
      (body.serviceId !== undefined && !isNonEmptyString(body.serviceId)) ||
      (body.date !== undefined && !isNonEmptyString(body.date)) ||
      (body.timeSlot !== undefined && !isNonEmptyString(body.timeSlot)) ||
      (body.customerName !== undefined && !isNonEmptyString(body.customerName))
    ) {
      throw new BadRequestException(
        'serviceId, date, timeSlot, customerName must be non-empty strings',
      );
    }

    if (body.serviceId !== undefined) {
      this.servicesService.getServiceById(body.serviceId);
    }

    if (body.serviceId !== undefined) booking.serviceId = body.serviceId;
    if (body.date !== undefined) booking.date = body.date;
    if (body.timeSlot !== undefined) booking.timeSlot = body.timeSlot;
    if (body.customerName !== undefined)
      booking.customerName = body.customerName;
    return booking;
  }

  deleteBooking(id: string): void {
    const index = this.bookings.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Booking not found');
    }
    this.bookings.splice(index, 1);
  }
}
