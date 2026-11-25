import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Service } from './entities/service.entity';

@Injectable()
export class ServicesRepository {
  constructor(
    @InjectRepository(Service)
    private readonly repository: Repository<Service>,
  ) {}

  findAll(): Promise<Service[]> {
    return this.repository.find({ order: { name: 'ASC' } });
  }

  findById(id: number): Promise<Service | null> {
    return this.repository.findOne({ where: { id } });
  }

}
