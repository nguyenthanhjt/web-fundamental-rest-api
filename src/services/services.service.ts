import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from './services.repository.js';
import { error } from 'console';

@Injectable()
export class ServicesService {
  constructor(private servicesRepository: ServicesRepository) {}

  findAll() {
    return this.servicesRepository.findAll();
  }

  findOne(id: string) {
    const service = this.servicesRepository.findById(id);
    if (!service) 
      throw new NotFoundException("Service not found");
    return service;
  }
}
