import { Controller, Get, Post, Body, Param, forwardRef, Inject } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { ReviewsService } from '../reviews/reviews.service.js';
import { CreateReviewDto } from '../reviews/dto/create-review.dto.js';

@Controller('api/v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService, @Inject(forwardRef(() => ReviewsService)) private readonly reviewsService: ReviewsService) {}

  @Get('')
  async findAll() {
    return await this.servicesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.servicesService.findOne(id);
  }

  @Get(':serviceId/reviews')
  async findAllReviews(@Param('serviceId') serviceId: string) {
    return await this.reviewsService.findAll(serviceId);
  }

  @Post(':serviceId/reviews')
  async createReview(@Param('serviceId') serviceId: string, @Body() createReviewDto: CreateReviewDto) {
    return await this.reviewsService.create(serviceId, createReviewDto);
  }
}
