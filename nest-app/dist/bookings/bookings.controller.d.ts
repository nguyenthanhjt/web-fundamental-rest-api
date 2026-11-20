import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    findAll(): import("./bookings.service.js").Booking[];
    findOne(id: string): import("./bookings.service.js").Booking;
    create(createBookingDto: CreateBookingDto, user: AuthenticatedUser): import("./bookings.service.js").Booking;
    replace(id: string, body: CreateBookingDto, user: AuthenticatedUser): Promise<import("./bookings.service.js").Booking>;
    update(id: string, body: UpdateBookingDto, user: AuthenticatedUser): Promise<import("./bookings.service.js").Booking>;
    remove(id: string, user: AuthenticatedUser): Promise<void>;
}
