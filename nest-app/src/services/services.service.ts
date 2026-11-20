import { Injectable } from '@nestjs/common';

export type Service = {
    id: string;
    name: string;
    capacity: number;
    price: number;
};

@Injectable()
export class ServicesService {
    private readonly services: Service[] = [
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

    findAll(): Service[] {
        return this.services;
    }

    findOne(id: string): Service {
        const service = this.services.find((service) => service.id === id);
        if (!service) {
            throw new Error(`Service with ID ${id} not found`);
        }
        return service;
    }

    exists(id: string): boolean {
        return this.services.some((service) => service.id === id);
    }
}
