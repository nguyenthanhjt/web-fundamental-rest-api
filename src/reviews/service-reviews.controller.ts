import { Body, Controller, Get, Param, Post, Request } from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator.js';
import type SecuredUser from '../auth/entities/secured-user.entity.js';
import type { CreateReviewDto } from './dto/create-review.dto.js';
import type { Review } from './review.entity.js';
import { ReviewsService } from './reviews.service.js';

@Controller('services/:serviceId/reviews')
export class ServiceReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  getReviewsByServiceId(@Param('serviceId') serviceId: string): Review[] {
    return this.reviewsService.getReviewsByServiceId(serviceId);
  }

  @Auth('USER', 'ADMIN')
  @Post()
  createReview(
    @Param('serviceId') serviceId: string,
    @Body() dto: Partial<CreateReviewDto>,
    @Request() req: { user: SecuredUser },
  ): Review {
    return this.reviewsService.createReview(serviceId, dto, req.user);
  }
}
