/** Request payload for creating a booking. */
export interface CreateBookingDto {
  serviceId: string;
  date: string;
  timeSlot: string;
}
