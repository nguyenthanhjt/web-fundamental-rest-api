// bookings/bookings.service.ts
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/enums/role.enum';
import { ServicesService } from '../services/services.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Booking } from './entities/booking.entity';
import { bookingsMock } from '../mock-data/bookings.mock';

const writableFields = ['serviceId', 'date', 'timeSlot'] as const;

@Injectable()
export class BookingsService {
  private readonly bookings: Booking[] = bookingsMock;
  private nextBookingNumber = 1;

  constructor(private readonly services: ServicesService) {}

  findAll(user: CurrentUserData) {
    return user.role === Role.Admin
      ? this.bookings
      : this.bookings.filter((booking) => booking.userId === user.sub);
  }

  findOne(id: string, user: CurrentUserData) {
    const booking = this.bookings.find((item) => item.id === id);
    if (!booking) {
      throw new NotFoundException({ message: 'Booking not found' });
    }
    this.assertCanAccess(booking, user);
    return booking;
  }

  private assertCanAccess(booking: Booking, user: CurrentUserData): void {
    if (user.role !== Role.Admin && booking.userId !== user.sub) {
      throw new ForbiddenException('You do not have access to this booking');
    }
  }

  create(userId: string, dto: CreateBookingDto) {
    const missing = writableFields.filter((field) => !dto[field]);
    if (missing.length > 0) {
      throw new BadRequestException({
        message: missing.join(', ') + ' are required',
      });
    }
    this.services.findOne(dto.serviceId);

    const booking: Booking = {
      id: 'bkg_' + String(this.nextBookingNumber).padStart(3, '0'),
      userId,
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      status: 'PENDING',
    };
    this.nextBookingNumber += 1;
    this.bookings.push(booking);
    return booking;
  }

  replace(id: string, dto: CreateBookingDto, user: CurrentUserData) {
    const booking = this.findOne(id, user);

    const missing = writableFields.filter((field) => !dto[field]);
    if (missing.length > 0) {
      throw new BadRequestException({
        message: missing.join(', ') + ' are required',
      });
    }
    this.services.findOne(dto.serviceId);

    booking.serviceId = dto.serviceId;
    booking.date = dto.date;
    booking.timeSlot = dto.timeSlot;
    return booking;
  }

  update(id: string, dto: UpdateBookingDto, user: CurrentUserData) {
    const booking = this.findOne(id, user);

    const fields = writableFields.filter((field) => dto[field]);
    if (fields.length === 0) {
      throw new BadRequestException({
        message: 'At least one of serviceId, date, timeSlot is required',
      });
    }
    if (dto.serviceId) {
      this.services.findOne(dto.serviceId);
    }

    fields.forEach((field) => {
      booking[field] = dto[field] as string;
    });
    return booking;
  }

  remove(id: string, user: CurrentUserData): void {
    const booking = this.findOne(id, user);
    const index = this.bookings.indexOf(booking);
    this.bookings.splice(index, 1);
  }
}
