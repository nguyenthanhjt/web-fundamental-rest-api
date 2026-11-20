import { ServicesService } from '../services/services.service.js';
export type Booking = {
    id: string;
    serviceId: string;
    date: string;
    timeSlot: string;
    customerName: string;
    status: 'PENDING';
};
type BookingData = Omit<Booking, 'id' | 'status'>;
export declare class BookingsService {
    private readonly servicesService;
    private readonly bookings;
    private nextBookingNumber;
    constructor(servicesService: ServicesService);
    findAll(): Booking[];
    findOne(id: string): Booking;
    create(data: BookingData): Booking;
    replace(id: string, data: BookingData): Booking;
    update(id: string, data: Partial<BookingData>): Booking;
    remove(id: string): void;
}
export {};
