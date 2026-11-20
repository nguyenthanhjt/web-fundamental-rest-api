import type { Booking } from '../../bookings/bookings.service.js';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js';
export declare class BookingPolicy {
    update(user: AuthenticatedUser, booking: Booking): boolean;
    delete(user: AuthenticatedUser, booking: Booking): boolean;
}
