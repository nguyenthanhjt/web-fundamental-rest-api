import { ServicesService } from '../services/services.service.js';
import { AuthorizationService } from '@nestjs/authorization';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export type Booking = {
    id: string;
    ownerId: number;
    serviceId: string;
    date: string;
    timeSlot: string;
    customerName: string;
    status: 'PENDING';
};
type BookingData = Omit<Booking, 'id' | 'status' | 'ownerId'>;
export declare class BookingsService {
    private readonly servicesService;
    private readonly authorization;
    private readonly bookings;
    private nextBookingNumber;
    constructor(servicesService: ServicesService, authorization: AuthorizationService);
    findAll(): Booking[];
    findOne(id: string): Booking;
    create(data: BookingData, ownerId: number): Booking;
    replace(id: string, data: BookingData, user: AuthenticatedUser): Promise<Booking>;
    update(id: string, data: Partial<BookingData>, user: AuthenticatedUser): Promise<Booking>;
    remove(id: string, user: AuthenticatedUser): Promise<void>;
}
export {};
