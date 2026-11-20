var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Injectable } from '@nestjs/common';
let ServicesService = class ServicesService {
    services = [
        {
            id: 'svc_001',
            name: 'Spa 60 phút',
            capacity: 4,
            price: 350000,
        },
        {
            id: 'svc_002',
            name: 'Gym theo buổi',
            capacity: 20,
            price: 80000,
        },
    ];
    findAll() {
        return this.services;
    }
    findOne(id) {
        const service = this.services.find((service) => service.id === id);
        if (!service) {
            throw new Error(`Service with ID ${id} not found`);
        }
        return service;
    }
    exists(id) {
        return this.services.some((service) => service.id === id);
    }
};
ServicesService = __decorate([
    Injectable()
], ServicesService);
export { ServicesService };
//# sourceMappingURL=services.service.js.map