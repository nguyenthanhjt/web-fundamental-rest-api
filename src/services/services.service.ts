import { Injectable, NotFoundException } from '@nestjs/common';
import { Service } from './entities/service.entity';
import { ServicesRepository } from './services.repository';

@Injectable()
export class ServicesService {
  constructor(private readonly servicesRepository: ServicesRepository) {}

  findAll() {
    return this.servicesRepository.findAll();
  }

  async findOne(id: number) {
    const service = await this.servicesRepository.findById(id);
    if (!service) {
      throw new NotFoundException({ message: 'Service not found' });
    }
    return service;
  }
}
