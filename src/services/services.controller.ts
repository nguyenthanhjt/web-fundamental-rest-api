import { Controller, Get, Post, Body, Param, forwardRef, Inject } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { ReviewsService } from '../reviews/reviews.service.js';
import { CreateReviewDto } from '../reviews/dto/create-review.dto.js';
import { CurrentUser, Public } from '@nestjs/authentication';
import { User } from '../users/entity/users.entity.js';

@Controller('api/v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService, @Inject(forwardRef(() => ReviewsService)) private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get('')
  async findAll() {
    return await this.servicesService.findAll();
  }
  
  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.servicesService.findOne(id);
  }

  @Public()
  @Get(':serviceId/reviews')
  async findAllReviews(@Param('serviceId') serviceId: string) {
    return (await this.reviewsService.findAll(serviceId)).map((value) => this.reviewsService.convertToReviewResponse(value));
  }

  @Post(':serviceId/reviews')
  async createReview(@Param('serviceId') serviceId: string, @Body() createReviewDto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.convertToReviewResponse(await this.reviewsService.create(serviceId, createReviewDto, user.id));
  }
}
