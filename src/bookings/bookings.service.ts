import {BadRequestException,Injectable,NotFoundException,} from '@nestjs/common';
import type { Booking } from './booking.interface.js';
import { BookingInput } from './booking.input.js';
import { ServicesService } from '../services/services.service.js';
import type {UpdateBookingInput} from '../bookings/updateBookingInput.js'
@Injectable()
export class BookingsService {
  constructor(private readonly servicesService: ServicesService) {}
  private bookings: Booking[] = [
    {
      id: 'bkg_001',
      serviceId: 'svc_001',
      date: '2026-11-20',
      timeSlot: '09:00',
      customerName: 'Nguyen Van A',
      status: 'PENDING',
    },
    {
      id: 'bkg_002',
      serviceId: 'svc_002',
      date: '2026-11-21',
      timeSlot: '14:00',
      customerName: 'Tran Van B',
      status: 'PENDING',
    },
  ];
  private nextId = 3;
  findAll(): Booking[] {
    return this.bookings;
  }

  findById(id: string): Booking {
    const booking = this.bookings.find((item) => item.id === id);

    if (!booking) {
      throw new NotFoundException(`Khong tim thay ${id}`);
    }

    return booking;
  }
  create(dto: BookingInput): Booking {
    const writableFields: (keyof BookingInput)[] = [
      'serviceId',
      'date',
      'timeSlot',
      'customerName',
    ];

    const missing = writableFields.filter((field) => !dto?.[field]);
    if (missing.length > 0) {
      throw new BadRequestException(`${missing.join(', ')} are required`);
    }

    this.servicesService.findById(dto.serviceId);

    const booking: Booking = {
      id: `bkg_${String(this.nextId++).padStart(3, '0')}`,
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      customerName: dto.customerName,
      status: 'PENDING',
    };

    this.bookings.push(booking);
    return booking;
  }
  replace(id: string, body: BookingInput): Booking {
  const booking = this.findById(id);

  const writableFields: (keyof BookingInput)[] = [
    'serviceId',
    'date',
    'timeSlot',
    'customerName',
  ];

  const missing = writableFields.filter(field => !body?.[field]);

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
update(id: string, body: UpdateBookingInput): Booking {
  const booking = this.findById(id);

  const writableFields: (keyof UpdateBookingInput)[] = [
    'serviceId',
    'date',
    'timeSlot',
    'customerName',
  ];

  const fields = writableFields.filter(
    field => body?.[field]
  );

  if (fields.length === 0) {
    throw new BadRequestException(
      'At least one field is required'
    );
  }

  if (body.serviceId) {
    this.servicesService.findById(body.serviceId);
  }

  fields.forEach(field => {
    booking[field] = body[field]!;
  });

  return booking;
}
delete(id : string) : void {
    const index = this.bookings.findIndex((item) => item.id === id);
    if(index === -1) {
        throw new NotFoundException("Booking not found");
    }
    this.bookings.splice(index,1);
}
}
