export type BookingStatus = 'PENDING';

export interface Booking {
  id: string;
  userId: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  status: BookingStatus;
}
