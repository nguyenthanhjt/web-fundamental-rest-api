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
import { AuthorizationService } from '@nestjs/authorization';
import { BookingPolicy } from '../authorization/policies/booking.policy.js';
let BookingsService = class BookingsService {
    servicesService;
    authorization;
    bookings = [];
    nextBookingNumber = 1;
    constructor(servicesService, authorization) {
        this.servicesService = servicesService;
        this.authorization = authorization;
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
    create(data, ownerId) {
        if (!this.servicesService.exists(data.serviceId)) {
            throw new BadRequestException(`Service with ID ${data.serviceId} does not exist`);
        }
        const booking = {
            id: `bkg_${this.nextBookingNumber.toString().padStart(3, '0')}`,
            ownerId,
            ...data,
            status: 'PENDING',
        };
        this.nextBookingNumber += 1;
        this.bookings.push(booking);
        return booking;
    }
    async replace(id, data, user) {
        const booking = this.findOne(id);
        await this.authorization.authorize(BookingPolicy, 'update', user, booking);
        if (!this.servicesService.exists(data.serviceId)) {
            throw new BadRequestException(`Service with ID ${data.serviceId} does not exist`);
        }
        Object.assign(booking, data);
        return booking;
    }
    async update(id, data, user) {
        const booking = this.findOne(id);
        if (Object.keys(data).length === 0) {
            throw new BadRequestException('At least one field is required');
        }
        await this.authorization.authorize(BookingPolicy, 'update', user, booking);
        if (data.serviceId &&
            !this.servicesService.exists(data.serviceId)) {
            throw new BadRequestException(`Service with ID ${data.serviceId} does not exist`);
        }
        Object.assign(booking, data);
        return booking;
    }
    async remove(id, user) {
        const index = this.bookings.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new NotFoundException(`Booking with ID ${id} not found`);
        }
        await this.authorization.authorize(BookingPolicy, 'delete', user, this.bookings[index]);
        this.bookings.splice(index, 1);
    }
};
BookingsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ServicesService, AuthorizationService])
], BookingsService);
export { BookingsService };
//# sourceMappingURL=bookings.service.js.map