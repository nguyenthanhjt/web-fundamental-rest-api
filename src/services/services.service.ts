// services/services.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { servicesMock } from '../mock-data/services.mock';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesService {
  private readonly services: Service[] = servicesMock;

  findAll() {
    return this.services;
  }

  findOne(id: string) {
    const service = this.services.find((item) => item.id === id);
    if (!service) {
      throw new NotFoundException({ message: 'Service not found' });
    }
    return service;
  }
}
