import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';

export type Review = {
  id: string;
  serviceId: string;
  authorName: string;
  rating: number;
  comment: string;
};

@Injectable()
export class ReviewsService {
  private readonly reviews: Review[] = [];
  private nextReviewNumber = 1;

  constructor(private readonly servicesService: ServicesService) {}

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

  create(serviceId: string, data: CreateReviewDto): Review {
    if (!this.servicesService.exists(serviceId)) {
      throw new NotFoundException(`Service with ID ${serviceId} not found`);
    }

    const review: Review = {
      id: `rev_${this.nextReviewNumber.toString().padStart(3, '0')}`,
      serviceId,
      authorName: data.authorName,
      rating: data.rating,
      comment: data.comment,
    };

    this.nextReviewNumber += 1;
    this.reviews.push(review);

    return review;
  }

  replace(id: string, data: CreateReviewDto): Review {
    const review = this.findOne(id);

    review.authorName = data.authorName;
    review.rating = data.rating;
    review.comment = data.comment;

    return review;
  }

  update(id: string, data: UpdateReviewDto): Review {
    const review = this.findOne(id);

    Object.assign(review, data);

    return review;
  }

  remove(id: string): void {
    const index = this.reviews.findIndex((item) => item.id === id);

    if (index === -1) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    this.reviews.splice(index, 1);
  }
}