import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { Booking } from './booking.model';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';

@Injectable()
export class BookingsService {
  private readonly bookings: Booking[] = [];
  private nextBookingNumber = 1;

  constructor(private readonly servicesService: ServicesService) {}

  findAll(): Booking[] {
    return this.bookings;
  }

  findOne(id: string): Booking {
    const booking = this.bookings.find((item) => item.id === id);
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return booking;
  }

  create(body: CreateBookingDto): Booking {
    this.servicesService.findOne(body.serviceId);

    const booking: Booking = {
      id: `bkg_${String(this.nextBookingNumber).padStart(3, '0')}`,
      serviceId: body.serviceId,
      date: body.date,
      timeSlot: body.timeSlot,
      customerName: body.customerName,
      status: 'PENDING',
    };
    this.nextBookingNumber += 1;
    this.bookings.push(booking);
    return booking;
  }

  replace(id: string, body: CreateBookingDto): Booking {
    const booking = this.findOne(id);
    this.servicesService.findOne(body.serviceId);

    booking.serviceId = body.serviceId;
    booking.date = body.date;
    booking.timeSlot = body.timeSlot;
    booking.customerName = body.customerName;
    return booking;
  }

  update(id: string, body: UpdateBookingDto): Booking {
    const booking = this.findOne(id);
    if (body.serviceId !== undefined) {
      this.servicesService.findOne(body.serviceId);
      booking.serviceId = body.serviceId;
    }
    if (body.date !== undefined) {
      booking.date = body.date;
    }
    if (body.timeSlot !== undefined) {
      booking.timeSlot = body.timeSlot;
    }
    if (body.customerName !== undefined) {
      booking.customerName = body.customerName;
    }
    return booking;
  }

  remove(id: string): void {
    const booking = this.findOne(id);
    this.bookings.splice(this.bookings.indexOf(booking), 1);
  }
}
