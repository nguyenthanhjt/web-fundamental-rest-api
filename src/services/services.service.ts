import { Injectable, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity.js';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class ServicesService {
  constructor(@InjectRepository(Service) private readonly servicesRepo: Repository<Service>) { }

  async onApplicationBootstrap() {
    await this.createSeedData();
  }

  private seedServices: Service[] = [
      { id: "svc_001", name: "Spa 60 phút", capacity: 4, price: 350000 },
      { id: "svc_002", name: "Gym theo buổi", capacity: 20, price: 80000 },
  ];

  private async createSeedData() {
    if (!(await this.servicesRepo.exists())) {
      this.seedServices.forEach(async (service) => await this.servicesRepo.save(service));
    }
  }

  async findAll() {
    return await this.servicesRepo.find();
  }

  async findOne(id: string) {
    const service = await this.servicesRepo.findOneBy({id});
    if (!service) 
      throw new NotFoundException("Service not found");
    return service;
  }
}
