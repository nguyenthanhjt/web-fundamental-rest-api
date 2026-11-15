import { Injectable } from "@nestjs/common";
import { Booking } from "./entities/booking.entity.js";

@Injectable()
export class BookingsRepository {
    private bookings: Booking[] = new Array;

    findAll(): Booking[] {
        return [...this.bookings];
    }

    findById(id: string): Booking | undefined {
        const booking = this.bookings.find((booking) => booking.id === id);
        if (!booking)
            return undefined;
        return {...booking};
    }

    save(booking: Booking): Booking {
        const existBooking = this.bookings.find((b) => b.id === booking.id);
        if (existBooking !== undefined) {
            existBooking.serviceId = booking.serviceId;
            existBooking.date = booking.date;
            existBooking.timeSlot = booking.timeSlot;
            existBooking.customerName = booking.customerName; 
        }
        else {
            this.bookings.push(booking);
        }
        return {...booking};
    }

    delete(id: string) {
        const index = this.bookings.findIndex((value) => value.id === id);
        if (index !== -1)
            this.bookings.splice(index, 1);
    }
}