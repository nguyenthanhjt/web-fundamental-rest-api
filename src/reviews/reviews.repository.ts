import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { Booking } from '../bookings/entities/booking.entity';
import { BookingStatus } from '../bookings/enums/booking-status.enum';

@Injectable()
export class ReviewsRepository {
  constructor(
    @InjectRepository(Review)
    private readonly repository: Repository<Review>,
    @InjectRepository(Booking)
    private readonly bookings: Repository<Booking>,
  ) {}

  findByServiceId(serviceId: number): Promise<Review[]> {
    return this.repository.find({ where: { serviceId } });
  }

  findById(id: number): Promise<Review | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByUserAndService(userId: number, serviceId: number): Promise<Review | null> {
    return this.repository.findOne({ where: { userId, serviceId } });
  }

  hasCompletedBooking(userId: number, serviceId: number): Promise<boolean> {
    return this.bookings.exists({ where: { userId, serviceId, status: BookingStatus.COMPLETED } });
  }

  create(data: Partial<Review>): Promise<Review> {
    return this.repository.save(this.repository.create(data));
  }

  async update(id: number, data: Partial<Review>): Promise<Review | null> {
    const review = await this.repository.preload({ id, ...data });
    return review ? this.repository.save(review) : null;
  }

  async remove(id: number,): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

}
