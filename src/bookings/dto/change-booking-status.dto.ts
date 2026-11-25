import { BookingStatus } from '../enums/booking-status.enum';

export class ChangeBookingStatusDto {
  status!: BookingStatus;
}
