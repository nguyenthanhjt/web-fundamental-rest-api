import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';

export type Booking = {
  id: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  status: 'PENDING';
};

type BookingData = Omit<Booking, 'id' | 'status'>;

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
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  create(data: BookingData): Booking {
    if (!this.servicesService.exists(data.serviceId)) {
      throw new BadRequestException(
        `Service with ID ${data.serviceId} does not exist`,
      );
    }

    const booking: Booking = {
      id: `bkg_${this.nextBookingNumber.toString().padStart(3, '0')}`,
      ...data,
      status: 'PENDING',
    };

    this.nextBookingNumber += 1;
    this.bookings.push(booking);

    return booking;
  }

  replace(id: string, data: BookingData): Booking {
    const booking = this.findOne(id);

    if (!this.servicesService.exists(data.serviceId)) {
      throw new BadRequestException(
        `Service with ID ${data.serviceId} does not exist`,
      );
    }

    booking.serviceId = data.serviceId;
    booking.date = data.date;
    booking.timeSlot = data.timeSlot;
    booking.customerName = data.customerName;

    return booking;
  }

  update(id: string, data: Partial<BookingData>): Booking {
    const booking = this.findOne(id);

    if (
      data.serviceId &&
      !this.servicesService.exists(data.serviceId)
    ) {
      throw new BadRequestException(
        `Service with ID ${data.serviceId} does not exist`,
      );
    }

    Object.assign(booking, data);

    return booking;
  }

  remove(id: string): void {
    const index = this.bookings.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    this.bookings.splice(index, 1);
  }
}