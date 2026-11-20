import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { AuthorizationService } from '@nestjs/authorization';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
import { ReviewPolicy } from '../authorization/policies/review.policy.js';

export type Review = {
  id: string;
  serviceId: string;
  authorId: number;
  authorName: string;
  rating: number;
  comment: string;
};

@Injectable()
export class ReviewsService {
  private readonly reviews: Review[] = [];
  private nextReviewNumber = 1;

  constructor(private readonly servicesService: ServicesService, private readonly authorization: AuthorizationService) {}

  findOne(id: string): Review {
    const review = this.reviews.find((item) => item.id === id);

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  findByServiceId(serviceId: string): Review[] {
    if (!this.servicesService.exists(serviceId)) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    return this.reviews.filter((review) => review.serviceId === serviceId);
  }

  create(serviceId: string, data: CreateReviewDto, authorId: number): Review {
    if (!this.servicesService.exists(serviceId)) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const review: Review = {
      id: `rev_${this.nextReviewNumber.toString().padStart(3, '0')}`,
      serviceId,
      authorId,
      authorName: data.authorName,
      rating: data.rating,
      comment: data.comment,
    };

    this.nextReviewNumber += 1;
    this.reviews.push(review);

    return review;
  }

  async replace(id: string, data: CreateReviewDto, user: AuthenticatedUser): Promise<Review> {
    const review = this.findOne(id);

    await this.authorization.authorize(ReviewPolicy, 'update', user, review);

    review.authorName = data.authorName;
    review.rating = data.rating;
    review.comment = data.comment;

    return review;
  }

  async update(id: string, data: UpdateReviewDto, user: AuthenticatedUser): Promise<Review> {
    const review = this.findOne(id);

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one field is required');
    }

    await this.authorization.authorize(ReviewPolicy, 'update', user, review);

    Object.assign(review, data);

    return review;
  }

  async remove(id: string, user: AuthenticatedUser): Promise<void> {
    const index = this.reviews.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    await this.authorization.authorize(ReviewPolicy, 'delete', user, this.reviews[index]);

    this.reviews.splice(index, 1);
  }
}