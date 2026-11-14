"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingsService = void 0;
const common_1 = require("@nestjs/common");
const services_service_js_1 = require("../services/services.service.js");
let BookingsService = class BookingsService {
    servicesService;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    bookings = [
        {
            id: 'bkg_001',
            serviceId: 'svc_001',
            date: '2026-11-20',
            timeSlot: '09:00',
            customerName: 'Nguyen Van A',
            status: 'PENDING',
        },
        {
            id: 'bkg_002',
            serviceId: 'svc_002',
            date: '2026-11-21',
            timeSlot: '14:00',
            customerName: 'Tran Van B',
            status: 'PENDING',
        },
    ];
    nextId = 3;
    findAll() {
        return this.bookings;
    }
    findById(id) {
        const booking = this.bookings.find((item) => item.id === id);
        if (!booking) {
            throw new common_1.NotFoundException(`Khong tim thay ${id}`);
        }
        return booking;
    }
    create(dto) {
        const writableFields = [
            'serviceId',
            'date',
            'timeSlot',
            'customerName',
        ];
        const missing = writableFields.filter((field) => !dto?.[field]);
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`${missing.join(', ')} are required`);
        }
        this.servicesService.findById(dto.serviceId);
        const booking = {
            id: `bkg_${String(this.nextId++).padStart(3, '0')}`,
            serviceId: dto.serviceId,
            date: dto.date,
            timeSlot: dto.timeSlot,
            customerName: dto.customerName,
            status: 'PENDING',
        };
        this.bookings.push(booking);
        return booking;
    }
    replace(id, body) {
        const booking = this.findById(id);
        const writableFields = [
            'serviceId',
            'date',
            'timeSlot',
            'customerName',
        ];
        const missing = writableFields.filter(field => !body?.[field]);
        if (missing.length > 0) {
            throw new common_1.BadRequestException(`${missing.join(', ')} are required`);
        }
        this.servicesService.findById(body.serviceId);
        booking.serviceId = body.serviceId;
        booking.date = body.date;
        booking.timeSlot = body.timeSlot;
        booking.customerName = body.customerName;
        return booking;
    }
    update(id, body) {
        const booking = this.findById(id);
        const writableFields = [
            'serviceId',
            'date',
            'timeSlot',
            'customerName',
        ];
        const fields = writableFields.filter(field => body?.[field]);
        if (fields.length === 0) {
            throw new common_1.BadRequestException('At least one field is required');
        }
        if (body.serviceId) {
            this.servicesService.findById(body.serviceId);
        }
        fields.forEach(field => {
            booking[field] = body[field];
        });
        return booking;
    }
    delete(id) {
        const index = this.bookings.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException("Booking not found");
        }
        this.bookings.splice(index, 1);
    }
};
exports.BookingsService = BookingsService;
exports.BookingsService = BookingsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_service_js_1.ServicesService])
], BookingsService);
