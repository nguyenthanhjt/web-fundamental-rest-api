import { Policy, type PolicyBefore } from '@nestjs/authorization';
import { Role } from '../auth/enum/roles.enum';
import type { User } from '../users/entities/user.entity';
import { BookingsService } from './bookings.service';
import { BookingStatus } from './enums/booking-status.enum';

@Policy()
export class BookingPolicy implements PolicyBefore<User> {
  constructor(private readonly bookingsService: BookingsService) {}

  before(user: User | null) {
    if (user?.role === Role.ADMIN) return true;
  }

  create(user: User | null)        { return !!user; }
  viewMine(user: User | null)      { return !!user; }
  changeStatus(_user: User | null) { return false; }

  viewAll(_user: User | null)    { return false; }
  assignUser(_user: User | null) { return false; }

  async view(user: User | null, bookingId: number) {
    if (!user) return false;
    const booking = await this.bookingsService.findOne(bookingId);
    return booking.userId === user.id;
  }

  async update(user: User | null, bookingId: number) {
    if (!user) return false;
    const booking = await this.bookingsService.findOne(bookingId);
    return booking.userId === user.id && booking.status === BookingStatus.PENDING;
  }

  async remove(user: User | null, bookingId: number) {
    if (!user) return false;
    const booking = await this.bookingsService.findOne(bookingId);
    return booking.userId === user.id && booking.status === BookingStatus.PENDING;
  }

  async cancel(user: User | null, bookingId: number) {
    if (!user) return false;
    const booking = await this.bookingsService.findOne(bookingId);
    return booking.userId === user.id && [BookingStatus.PENDING, BookingStatus.CONFIRMED].includes(booking.status);
  }
}
