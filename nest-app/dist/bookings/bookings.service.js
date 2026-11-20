var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { BadRequestException, Injectable, NotFoundException, } from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';
let BookingsService = class BookingsService {
    servicesService;
    bookings = [];
    nextBookingNumber = 1;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    findAll() {
        return this.bookings;
    }
    findOne(id) {
        const booking = this.bookings.find((item) => item.id === id);
        if (!booking) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }
        return booking;
    }
    create(data) {
        if (!this.servicesService.exists(data.serviceId)) {
            throw new BadRequestException(`Service with ID ${data.serviceId} does not exist`);
        }
        const booking = {
            id: `bkg_${this.nextBookingNumber.toString().padStart(3, '0')}`,
            ...data,
            status: 'PENDING',
        };
        this.nextBookingNumber += 1;
        this.bookings.push(booking);
        return booking;
    }
    replace(id, data) {
        const booking = this.findOne(id);
        if (!this.servicesService.exists(data.serviceId)) {
            throw new BadRequestException(`Service with ID ${data.serviceId} does not exist`);
        }
        booking.serviceId = data.serviceId;
        booking.date = data.date;
        booking.timeSlot = data.timeSlot;
        booking.customerName = data.customerName;
        return booking;
    }
    update(id, data) {
        const booking = this.findOne(id);
        if (data.serviceId &&
            !this.servicesService.exists(data.serviceId)) {
            throw new BadRequestException(`Service with ID ${data.serviceId} does not exist`);
        }
        Object.assign(booking, data);
        return booking;
    }
    remove(id) {
        const index = this.bookings.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }
        this.bookings.splice(index, 1);
    }
};
BookingsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ServicesService])
], BookingsService);
export { BookingsService };
//# sourceMappingURL=bookings.service.js.map