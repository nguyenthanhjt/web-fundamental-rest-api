import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { BookingsRepository } from './bookings.repository';
import { BookingStatus } from './enums/booking-status.enum';

const writableFields = ['serviceId', 'date', 'timeSlot'] as const;

@Injectable()
export class BookingsService {
  constructor(
    private readonly services: ServicesService,
    private readonly bookingsRepository: BookingsRepository,
  ) {}

  findAll() { return this.bookingsRepository.findAll(); }

  findMine(userId: number) { return this.bookingsRepository.findByUserId(userId); }

  async findOne(id: number) {
    const booking = await this.bookingsRepository.findById(id);
    if (!booking) throw new NotFoundException({ message: 'Booking not found' });
    return booking;
  }

  async create(dto: CreateBookingDto, userId: number) {
    this.validate(dto);
    await this.services.findOne(dto.serviceId);
    return this.bookingsRepository.create({
      userId,
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
      status: BookingStatus.PENDING,
    });
  }

  async replace(id: number, dto: CreateBookingDto) {
    await this.findOne(id);
    this.validate(dto);
    await this.services.findOne(dto.serviceId);
    const updated = await this.bookingsRepository.update(id, {
      serviceId: dto.serviceId,
      date: dto.date,
      timeSlot: dto.timeSlot,
    });
    if (!updated) throw new NotFoundException({ message: 'Booking not found' });
    return updated;
  }

  async update(id: number, dto: UpdateBookingDto) {
    await this.findOne(id);
    this.validatePartial(dto);
    const fields = writableFields.filter((field) => dto[field] !== undefined);
    if (fields.length === 0) {
      throw new BadRequestException({ message: 'At least one of serviceId, date, timeSlot is required' });
    }
    if (dto.serviceId) await this.services.findOne(dto.serviceId);
    const data = Object.fromEntries(fields.map((field) => [field, dto[field]]));
    const updated = await this.bookingsRepository.update(id, {
      ...data,
    });
    if (!updated) throw new NotFoundException({ message: 'Booking not found' });
    return updated;
  }

  async changeStatus(id: number, status: BookingStatus) {
    await this.findOne(id);
    if (!this.isBookingStatus(status)) {
      throw new BadRequestException({
        message: `status must be one of: ${Object.values(BookingStatus).join(', ')}`,
      });
    }
    const updated = await this.bookingsRepository.update(id, { status });
    if (!updated) throw new NotFoundException({ message: 'Booking not found' });
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.bookingsRepository.remove(id);
  }

  private validate(dto: CreateBookingDto) {
    if (!Number.isInteger(dto?.serviceId) || dto.serviceId <= 0) {
      throw new BadRequestException({ message: 'serviceId must be a positive integer' });
    }
    if (!this.isValidDate(dto?.date)) {
      throw new BadRequestException({ message: 'date must be a valid YYYY-MM-DD date' });
    }
    if (typeof dto?.timeSlot !== 'string' || dto.timeSlot.trim().length < 1 || dto.timeSlot.length > 80) {
      throw new BadRequestException({ message: 'timeSlot must be between 1 and 80 characters' });
    }
    const missing = writableFields.filter((field) => dto[field] === undefined);
    if (missing.length > 0) {
      throw new BadRequestException({ message: `${missing.join(', ')} are required` });
    }
  }

  private validatePartial(dto: UpdateBookingDto) {
    if (dto.serviceId !== undefined && (!Number.isInteger(dto.serviceId) || dto.serviceId <= 0)) {
      throw new BadRequestException({ message: 'serviceId must be a positive integer' });
    }
    if (dto.date !== undefined && !this.isValidDate(dto.date)) {
      throw new BadRequestException({ message: 'date must be a valid YYYY-MM-DD date' });
    }
    if (dto.timeSlot !== undefined && (typeof dto.timeSlot !== 'string' || dto.timeSlot.trim().length < 1 || dto.timeSlot.length > 80)) {
      throw new BadRequestException({ message: 'timeSlot must be between 1 and 80 characters' });
    }
  }

  private isBookingStatus(status: string): status is BookingStatus {
    return Object.values(BookingStatus).includes(status as BookingStatus);
  }

  private isValidDate(value: unknown): value is string {
    if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
    const [year, month, day] = value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  }
}
