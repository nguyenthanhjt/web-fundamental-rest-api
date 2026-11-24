import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type SecuredUser from '../auth/entities/secured-user.entity.js';
import { ServicesService } from '../services/services.service.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';
import type { PatchReviewDto } from './dto/patch-review.dto.js';
import type { UpdateReviewDto } from './dto/update-review.dto.js';
import { Review } from './review.entity.js';

function isValidRating(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= 1 &&
    value <= 5
  );
}

function validateOptionalReviewFields(rating: unknown, comment: unknown): void {
  if (rating !== undefined && !isValidRating(rating)) {
    throw new BadRequestException('Invalid rating (1-5)');
  }
  if (comment !== undefined && typeof comment !== 'string') {
    throw new BadRequestException('comment must be a string');
  }
}

function validateFullReviewBody(
  body: Partial<UpdateReviewDto>,
  requireComment: boolean,
): void {
  const { rating, comment } = body;

  if (requireComment) {
    if (rating === undefined || comment === undefined) {
      throw new BadRequestException(
        'Missing required fields (rating, comment)',
      );
    }
  } else if (rating === undefined) {
    throw new BadRequestException('Missing required fields (rating)');
  }

  validateOptionalReviewFields(rating, comment);
}

@Injectable()
export class ReviewsService {
  private readonly reviews: Review[] = [
    {
      id: 'rv_001',
      userId: 'user_001',
      serviceId: 'svc_001',
      rating: 5,
      comment: 'Hay qua',
    },
  ];
  private nextReviewNumber = this.reviews.length + 1;

  constructor(private readonly servicesService: ServicesService) {}

  private findOwnedReview(id: string, user: SecuredUser): Review {
    const review = this.getReviewById(id);
    if (user.role !== 'ADMIN' && review.userId !== user.id) {
      throw new ForbiddenException('You do not have access to this review');
    }
    return review;
  }

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

  createReview(
    serviceId: string,
    dto: Partial<CreateReviewDto>,
    user: SecuredUser,
  ): Review {
    this.servicesService.getServiceById(serviceId);
    const body = dto ?? {};
    validateFullReviewBody(body, false);

    const review: Review = {
      id: `rv_${String(this.nextReviewNumber++).padStart(3, '0')}`,
      userId: user.id,
      serviceId,
      rating: body.rating as number,
      comment: body.comment ?? '',
    };
    this.reviews.push(review);
    return review;
  }

  updateReview(
    id: string,
    dto: Partial<UpdateReviewDto>,
    user: SecuredUser,
  ): Review {
    const review = this.findOwnedReview(id, user);
    const body = dto ?? {};
    validateFullReviewBody(body, true);

    review.rating = body.rating as number;
    review.comment = body.comment as string;
    return review;
  }

  patchReview(id: string, dto: PatchReviewDto, user: SecuredUser): Review {
    const review = this.findOwnedReview(id, user);
    const body = dto ?? {};
    const { rating, comment } = body;

    if (rating === undefined && comment === undefined) {
      throw new BadRequestException(
        'Missing required fields (rating or comment)',
      );
    }
    validateOptionalReviewFields(rating, comment);

    if (rating !== undefined) review.rating = rating;
    if (comment !== undefined) review.comment = comment;
    return review;
  }

  deleteReview(id: string, user: SecuredUser): void {
    const review = this.findOwnedReview(id, user);
    const index = this.reviews.indexOf(review);
    this.reviews.splice(index, 1);
  }
}
