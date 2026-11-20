import { Policy } from '@nestjs/authorization';
import type { Booking } from '../../bookings/bookings.service.js';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js';
import { UserRole } from '../../users/enums/user-role.enum.js';

@Policy()
export class BookingPolicy {
  update(user: AuthenticatedUser, booking: Booking): boolean {
    return user.role === UserRole.ADMIN || booking.ownerId === user.id;
  }

  delete(user: AuthenticatedUser, booking: Booking): boolean {
    return this.update(user, booking);
  }
}