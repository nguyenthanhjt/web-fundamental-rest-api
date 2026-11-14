
import {
  Controller,
  Get,
  Post,
  Param,
  Body,
} from '@nestjs/common';

import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import type { Review } from './review.interface.js';

@Controller('api/v1/services/:serviceId/reviews')
export class ServiceReviewsController {
  constructor(
    private readonly reviewService: ReviewsService,
  ) {}

  @Get()
  findByServiceId(
    @Param('serviceId') serviceId: string,
  ): Review[] {
    return this.reviewService.findByServiceId(serviceId);
  }


  @Post()
  create(
    @Param('serviceId') serviceId: string,
    @Body() body: CreateReviewDto,
  ): Review {
    return this.reviewService.create(serviceId, body);
  }
}
