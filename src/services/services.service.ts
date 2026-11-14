import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class ServicesService {
  private services = [
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

  findById(id: string) {
    const service = this.services.find(
      item => item.id === id,
    );

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }
}