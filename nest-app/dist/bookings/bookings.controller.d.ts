import { BookingsService } from './bookings.service.js';
import { CreateBookingDto } from './dto/create-booking.dto.js';
import { UpdateBookingDto } from './dto/update-booking.dto.js';
export declare class BookingsController {
    private readonly bookingsService;
    constructor(bookingsService: BookingsService);
    findAll(): import("./bookings.service.js").Booking[];
    findOne(id: string): import("./bookings.service.js").Booking;
    create(createBookingDto: CreateBookingDto): import("./bookings.service.js").Booking;
    replace(id: string, body: CreateBookingDto): import("./bookings.service.js").Booking;
    update(id: string, body: UpdateBookingDto): import("./bookings.service.js").Booking;
    remove(id: string): void;
}
