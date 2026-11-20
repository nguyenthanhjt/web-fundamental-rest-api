// bookings/dto/create-booking.dto.ts
import { Allow } from 'class-validator';

export class CreateBookingDto {
  @Allow() serviceId!: string;
  @Allow() date!: string;
  @Allow() timeSlot!: string;
}
