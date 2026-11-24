import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type SecuredUser from '../auth/entities/secured-user.entity.js';
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

  private findOwnedBooking(id: string, user: SecuredUser): Booking {
    const booking = this.bookings.find((item) => item.id === id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    if (user.role !== 'ADMIN' && booking.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this booking');
    }
    return booking;
  }

  getAllBookings(user: SecuredUser): Booking[] {
    if (user.role === 'ADMIN') {
      return this.bookings;
    }
    return this.bookings.filter((item) => item.userId === user.id);
  }

  getBookingById(id: string, user: SecuredUser): Booking {
    return this.findOwnedBooking(id, user);
  }

  createBooking(dto: Partial<CreateBookingDto>, user: SecuredUser): Booking {
    const body = dto ?? {};
    if (
      !isNonEmptyString(body.serviceId) ||
      !isNonEmptyString(body.date) ||
      !isNonEmptyString(body.timeSlot)
    ) {
      throw new BadRequestException('serviceId, date, timeSlot are required');
    }

    this.servicesService.getServiceById(body.serviceId);

    const booking: Booking = {
      id: `bkg_${String(this.nextBookingNumber++).padStart(3, '0')}`,
      userId: user.id,
      serviceId: body.serviceId,
      date: body.date,
      timeSlot: body.timeSlot,
      status: 'PENDING',
    };
    this.bookings.push(booking);
    return booking;
  }

  updateBooking(
    id: string,
    dto: Partial<UpdateBookingDto>,
    user: SecuredUser,
  ): Booking {
    const booking = this.findOwnedBooking(id, user);
    const body = dto ?? {};
    if (
      !isNonEmptyString(body.serviceId) ||
      !isNonEmptyString(body.date) ||
      !isNonEmptyString(body.timeSlot)
    ) {
      throw new BadRequestException('serviceId, date, timeSlot are required');
    }

    this.servicesService.getServiceById(body.serviceId);

    booking.serviceId = body.serviceId;
    booking.date = body.date;
    booking.timeSlot = body.timeSlot;
    return booking;
  }

  patchBooking(id: string, dto: PatchBookingDto, user: SecuredUser): Booking {
    const booking = this.findOwnedBooking(id, user);
    const body = dto ?? {};

    if (
      body.serviceId === undefined &&
      body.date === undefined &&
      body.timeSlot === undefined
    ) {
      throw new BadRequestException(
        'At least one of serviceId, date, timeSlot is required',
      );
    }

    if (
      (body.serviceId !== undefined && !isNonEmptyString(body.serviceId)) ||
      (body.date !== undefined && !isNonEmptyString(body.date)) ||
      (body.timeSlot !== undefined && !isNonEmptyString(body.timeSlot))
    ) {
      throw new BadRequestException(
        'serviceId, date, timeSlot must be non-empty strings',
      );
    }

    if (body.serviceId !== undefined) {
      this.servicesService.getServiceById(body.serviceId);
    }

    if (body.serviceId !== undefined) booking.serviceId = body.serviceId;
    if (body.date !== undefined) booking.date = body.date;
    if (body.timeSlot !== undefined) booking.timeSlot = body.timeSlot;
    return booking;
  }

  deleteBooking(id: string, user: SecuredUser): void {
    const booking = this.findOwnedBooking(id, user);
    const index = this.bookings.indexOf(booking);
    this.bookings.splice(index, 1);
  }
}
