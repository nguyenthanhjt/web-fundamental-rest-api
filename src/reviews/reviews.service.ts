import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';
import type { PatchReviewDto } from './dto/patch-review.dto.js';
import type { UpdateReviewDto } from './dto/update-review.dto.js';
import { Review } from './review.entity.js';

function isValidAuthorName(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

function isValidRating(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 5
  );
}

function validateFullReviewBody(
  body: Partial<UpdateReviewDto>,
  requireComment: boolean,
): void {
  const { authorName, rating, comment } = body;

  if (requireComment) {
    if (
      authorName === undefined ||
      rating === undefined ||
      comment === undefined
    ) {
      throw new BadRequestException(
        'Missing required fields (authorName, rating, comment)',
      );
    }
  } else if (authorName === undefined || rating === undefined) {
    throw new BadRequestException(
      'Missing required fields (authorName, rating)',
    );
  }

  if (!isValidAuthorName(authorName)) {
    throw new BadRequestException('authorName must be a non-empty string');
  }
  if (!isValidRating(rating)) {
    throw new BadRequestException('Invalid rating (1-5)');
  }
  if (comment !== undefined && typeof comment !== 'string') {
    throw new BadRequestException('comment must be a string');
  }
}

@Injectable()
export class ReviewsService {
  private readonly reviews: Review[] = [
    {
      id: 'rv_001',
      serviceId: 'svc_001',
      authorName: 'Hung',
      rating: 5,
      comment: 'Hay qua',
    },
  ];
  private nextReviewNumber = this.reviews.length + 1;

  constructor(private readonly servicesService: ServicesService) {}

  getReviewsByServiceId(serviceId: string): Review[] {
    // Check if the service exists
    this.servicesService.getServiceById(serviceId);

    return this.reviews.filter((review) => review.serviceId === serviceId);
  }

  getReviewById(id: string): Review {
    const review = this.reviews.find((item) => item.id === id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  createReview(serviceId: string, dto: Partial<CreateReviewDto>): Review {
    const body = dto ?? {};
    validateFullReviewBody(body, false);
    this.servicesService.getServiceById(serviceId);

    const review: Review = {
      id: `rv_${String(this.nextReviewNumber++).padStart(3, '0')}`,
      serviceId,
      authorName: (body.authorName as string).trim(),
      rating: body.rating as number,
      comment: body.comment ?? '',
    };
    this.reviews.push(review);
    return review;
  }

  updateReview(id: string, dto: Partial<UpdateReviewDto>): Review {
    const body = dto ?? {};
    validateFullReviewBody(body, true);

    const review = this.getReviewById(id);
    review.authorName = (body.authorName as string).trim();
    review.rating = body.rating as number;
    review.comment = body.comment as string;
    return review;
  }

  patchReview(id: string, dto: PatchReviewDto): Review {
    const body = dto ?? {};
    const { authorName, rating, comment } = body;

    if (
      authorName === undefined &&
      rating === undefined &&
      comment === undefined
    ) {
      throw new BadRequestException(
        'Missing required fields (authorName or rating or comment)',
      );
    }
    if (authorName !== undefined && !isValidAuthorName(authorName)) {
      throw new BadRequestException('authorName must be a non-empty string');
    }
    if (rating !== undefined && !isValidRating(rating)) {
      throw new BadRequestException('Invalid rating (1-5)');
    }
    if (comment !== undefined && typeof comment !== 'string') {
      throw new BadRequestException('comment must be a string');
    }

    const review = this.getReviewById(id);
    if (authorName !== undefined) review.authorName = authorName.trim();
    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    return review;
  }

  deleteReview(id: string): void {
    const index = this.reviews.findIndex((item) => item.id === id);
    if (index === -1) {
      throw new NotFoundException('Review not found');
    }
    this.reviews.splice(index, 1);
  }
}
