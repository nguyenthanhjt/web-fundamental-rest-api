import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ServicesService } from '../services/services.service.js';
import { Role } from '../users/enums/role.enum.js';

import type { Booking } from './booking.interface.js';
import type { BookingInput } from './booking.input.js';
import type { UpdateBookingInput } from './updateBookingInput.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { assertOwnerOrAdmin } from '../auth/resource-access.js';

type BookingActor = AuthenticatedUser;

@Injectable()
export class BookingsService {
  private readonly bookings: Booking[] = [];
  private nextId = 1;

  constructor(
    private readonly servicesService: ServicesService,
  ) {}

  findAll(actor: BookingActor): Booking[] {
    if (actor.role === Role.ADMIN) {
      return [...this.bookings];
    }

    return this.bookings.filter(
      (booking) => booking.ownerId === actor.id,
    );
  }

  findById(id: string, actor: BookingActor): Booking {
    const booking = this.bookings.find(
      (item) => item.id === id,
    );

    if (!booking) {
      throw new NotFoundException(`Khong tim thay ${id}`);
    }

    this.assertCanAccess(booking, actor);

    return booking;
  }

  create(dto: BookingInput, actor: BookingActor): Booking {
    const writableFields: (keyof BookingInput)[] = [
      'serviceId',
      'date',
      'timeSlot',
      'customerName',
    ];

    const missing = writableFields.filter(
      (field) => !dto?.[field],
    );

    if (missing.length > 0) {
      throw new BadRequestException(
        `${missing.join(', ')} are required`,
      );
    }

    this.servicesService.findById(dto.serviceId);

    const booking: Booking = {
      id: `bkg_${String(this.nextId++).padStart(3, '0')}`,
      ownerId: actor.id,
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      customerName: dto.customerName,
      status: 'PENDING',
    };

    this.bookings.push(booking);

    return booking;
  }

  replace(
    id: string,
    body: BookingInput,
    actor: BookingActor,
  ): Booking {
    const booking = this.findById(id, actor);

    const writableFields: (keyof BookingInput)[] = [
      'serviceId',
      'date',
      'timeSlot',
      'customerName',
    ];

    const missing = writableFields.filter(
      (field) => !body?.[field],
    );

    if (missing.length > 0) {
      throw new BadRequestException(
        `${missing.join(', ')} are required`,
      );
    }

    this.servicesService.findById(body.serviceId);

    booking.serviceId = body.serviceId;
    booking.date = body.date;
    booking.timeSlot = body.timeSlot;
    booking.customerName = body.customerName;

    return booking;
  }

  update(
    id: string,
    body: UpdateBookingInput,
    actor: BookingActor,
  ): Booking {
    const booking = this.findById(id, actor);

    const writableFields: (keyof UpdateBookingInput)[] = [
      'serviceId',
      'date',
      'timeSlot',
      'customerName',
    ];

    const fields = writableFields.filter(
      (field) => body?.[field] !== undefined,
    );

    if (fields.length === 0) {
      throw new BadRequestException(
        'At least one field is required',
      );
    }

    if (body.serviceId) {
      this.servicesService.findById(body.serviceId);
    }

    fields.forEach((field) => {
      booking[field] = body[field]!;
    });

    return booking;
  }

  delete(id: string, actor: BookingActor): void {
    const booking = this.findById(id, actor);
    const index = this.bookings.indexOf(booking);

    this.bookings.splice(index, 1);
  }

  private assertCanAccess(
    booking: Booking,
    actor: BookingActor,
  ): void {
    assertOwnerOrAdmin(booking.ownerId, actor);
  }
}
