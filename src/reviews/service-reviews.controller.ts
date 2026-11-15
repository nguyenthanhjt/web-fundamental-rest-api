import { Body, Controller, Get, Param, Post } from '@nestjs/common';
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

  @Post()
  createReview(
    @Param('serviceId') serviceId: string,
    @Body() dto: Partial<CreateReviewDto>,
  ): Review {
    return this.reviewsService.createReview(serviceId, dto);
  }
}
