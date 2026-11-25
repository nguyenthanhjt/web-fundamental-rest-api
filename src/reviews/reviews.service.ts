import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { QueryFailedError } from 'typeorm';
import { ServicesService } from '../services/services.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplaceReviewDto } from './dto/replace-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsRepository } from './reviews.repository';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly services: ServicesService,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  async findByService(serviceId: number) {
    await this.services.findOne(serviceId);
    return this.reviewsRepository.findByServiceId(serviceId);
  }

  async findOne(id: number) {
    const review = await this.reviewsRepository.findById(id);
    if (!review) throw new NotFoundException({ message: 'Review not found' });
    return review;
  }

  async create(serviceId: number, dto: CreateReviewDto, userId: number) {
    this.validateServiceId(serviceId);
    this.validateReview(dto?.rating, dto?.comment, true);
    await this.services.findOne(serviceId);
    if (!(await this.reviewsRepository.hasCompletedBooking(userId, serviceId))) {
      throw new ForbiddenException('A completed booking is required to review this service');
    }
    if (await this.reviewsRepository.findByUserAndService(userId, serviceId)) {
      throw new ConflictException('You have already reviewed this service');
    }
    try {
      return await this.reviewsRepository.create({
        userId,
        serviceId,
        rating: dto.rating,
        comment: dto.comment ?? '',
      });
    } catch (error) {
      if (error instanceof QueryFailedError && (error as QueryFailedError & { driverError?: { code?: string } }).driverError?.code === '23505') {
        throw new ConflictException('You have already reviewed this service');
      }
      throw error;
    }
  }

  async replace(id: number, dto: ReplaceReviewDto) {
    await this.findOne(id);
    this.validateReview(dto?.rating, dto?.comment, true);
    const updated = await this.reviewsRepository.update(id, {
      rating: dto.rating,
      comment: dto.comment,
    });
    if (!updated) throw new NotFoundException({ message: 'Review not found' });
    return updated;
  }

  async update(id: number, dto: UpdateReviewDto) {
    await this.findOne(id);
    if (dto.rating === undefined && dto.comment === undefined) {
      throw new BadRequestException({ message: 'At least one of rating, comment is required' });
    }
    this.validateReview(dto.rating, dto.comment);
    const updated = await this.reviewsRepository.update(id, {
      ...(dto.rating !== undefined ? { rating: dto.rating } : {}),
      ...(dto.comment !== undefined ? { comment: dto.comment } : {}),
    });
    if (!updated) throw new NotFoundException({ message: 'Review not found' });
    return updated;
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.reviewsRepository.remove(id);
  }

  private validateServiceId(serviceId: number) {
    if (!Number.isInteger(serviceId) || serviceId <= 0) {
      throw new BadRequestException('serviceId must be a positive integer');
    }
  }

  private validateReview(rating?: number, comment?: string, required = false) {
    if (required && rating === undefined) {
      throw new BadRequestException('rating is required');
    }
    if (rating !== undefined && (!Number.isInteger(rating) || rating < 1 || rating > 5)) {
      throw new BadRequestException('rating must be an integer between 1 and 5');
    }
    if (comment !== undefined && (typeof comment !== 'string' || comment.length > 2000)) {
      throw new BadRequestException('comment must be at most 2000 characters');
    }
  }
}
