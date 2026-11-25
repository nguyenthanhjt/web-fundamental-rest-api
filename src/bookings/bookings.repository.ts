import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';

@Injectable()
export class BookingsRepository {
  constructor(
    @InjectRepository(Booking)
    private readonly repository: Repository<Booking>,
  ) {}

  findAll(): Promise<Booking[]> {
    return this.repository.find({ order: { date: 'ASC', timeSlot: 'ASC' } });
  }

  findById(id: number): Promise<Booking | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByUserId(userId: number): Promise<Booking[]> {
    return this.repository.find({ where: { userId }, order: { date: 'ASC', timeSlot: 'ASC' } });
  }

  create(data: Partial<Booking>): Promise<Booking> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: number, data: Partial<Booking>): Promise<Booking | null> {
    const booking = await this.repository.preload({ id, ...data });
    return booking ? this.repository.save(booking) : null;
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

}
