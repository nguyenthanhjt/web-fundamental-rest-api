
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { ServicesService } from '../services/services.service.js';
import type { Review } from './review.interface.js';

import type { CreateReviewDto } from './dto/create-review.dto.js';
import type { ReplaceReviewDto } from './dto/replace-review.dto.js';
import type { UpdateReviewDto } from './dto/update-review.dto.js';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly serviceService: ServicesService,
  ) {}

  private reviews: Review[] = [];
  private nextId = 1;


  findByServiceId(serviceId: string): Review[] {
    this.serviceService.findById(serviceId);

    return this.reviews.filter(
      item => item.serviceId === serviceId,
    );
  }

  findAll(): Review[] {
    return this.reviews;
  }


  findById(id: string): Review {
    const review = this.reviews.find(
      item => item.id === id,
    );

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    return review;
  }


  create(serviceId: string, dto: CreateReviewDto): Review {
    this.serviceService.findById(serviceId);
    const review: Review = {
      id: 'rev_' + String(this.nextId++).padStart(3, '0'),
      serviceId,
      authorName: dto.authorName,
      rating: dto.rating,
      comment: dto.comment ?? '',
    };

    this.reviews.push(review);

    return review;
  }
  replace(id: string, dto: ReplaceReviewDto): Review {
    const review = this.findById(id);
    review.authorName = dto.authorName;
    review.rating = dto.rating;
    review.comment = dto.comment;

    return review;
  }

  update(id: string, dto: UpdateReviewDto): Review {
    const review = this.findById(id);

    const fields: (keyof UpdateReviewDto)[] = [
      'authorName',
      'rating',
      'comment',
    ];

    const presentFields = fields.filter(
      field => Object.hasOwn(dto ?? {}, field),
    );

    if (presentFields.length === 0) {
      throw new BadRequestException(
        'At least one field is required',
      );
    }

    if (Object.hasOwn(dto, 'authorName')) {
      review.authorName = dto.authorName!;
    }

    if (Object.hasOwn(dto, 'rating')) {
      review.rating = dto.rating!;
    }

    if (Object.hasOwn(dto, 'comment')) {
      review.comment = dto.comment!;
    }

    return review;
  }

  delete(id: string): void {
    const index = this.reviews.findIndex(
      item => item.id === id,
    );

    if (index === -1) {
      throw new NotFoundException('Review not found');
    }

    this.reviews.splice(index, 1);
  }
}
