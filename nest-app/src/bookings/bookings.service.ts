import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { AuthorizationService } from '@nestjs/authorization';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { BookingPolicy } from '../authorization/policies/booking.policy.js';


export type Booking = {
  id: string;
  ownerId: number;
  serviceId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  status: 'PENDING';
};

type BookingData = Omit<Booking, 'id' | 'status' | 'ownerId'>;

@Injectable()
export class BookingsService {
  private readonly bookings: Booking[] = [];
  private nextBookingNumber = 1;

  constructor(private readonly servicesService: ServicesService, private readonly authorization: AuthorizationService) {}

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

  create(data: BookingData, ownerId: number): Booking {
    if (!this.servicesService.exists(data.serviceId)) {
      throw new BadRequestException(
        `Service with ID ${data.serviceId} does not exist`,
      );
    }

    const booking: Booking = {
      id: `bkg_${this.nextBookingNumber.toString().padStart(3, '0')}`,
      ownerId,
      ...data,
      status: 'PENDING',
    };

    this.nextBookingNumber += 1;
    this.bookings.push(booking);

    return booking;
  }

  async replace(id: string, data: BookingData, user: AuthenticatedUser): Promise<Booking> {
    const booking = this.findOne(id);

    await this.authorization.authorize(BookingPolicy, 'update', user, booking,);

    if (!this.servicesService.exists(data.serviceId)) {
      throw new BadRequestException(
        `Service with ID ${data.serviceId} does not exist`,
      );
    }

    Object.assign(booking, data);

    return booking;
  }

  async update(id: string, data: Partial<BookingData>, user: AuthenticatedUser): Promise<Booking> {
    const booking = this.findOne(id);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    await this.authorization.authorize(BookingPolicy, 'update', user, booking,);

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

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const index = this.bookings.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    await this.authorization.authorize(BookingPolicy, 'delete', user, this.bookings[index],);

    this.bookings.splice(index, 1);
  }
}