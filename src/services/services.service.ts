import { Injectable, NotFoundException } from '@nestjs/common';
import { Service } from './service.entity.js';

@Injectable()
export class ServicesService {
  private readonly services: Service[] = [
    { id: 'svc_001', name: 'Spa 60 phút', capacity: 4, price: 350000 },
    { id: 'svc_002', name: 'Gym theo buổi', capacity: 20, price: 80000 },
  ];

  getAllServices(): Service[] {
    return this.services;
  }

  getServiceById(id: string): Service {
    const service = this.services.find((item) => item.id === id);
    if (!service) {
      throw new NotFoundException('Service not found');
    }
    return service;
  }
}
