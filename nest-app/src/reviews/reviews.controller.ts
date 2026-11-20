import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('services/:serviceId/reviews')
  findByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByServiceId(serviceId);
  }

  @Post('services/:serviceId/reviews')
  create(
    @Param('serviceId') serviceId: string,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.create(serviceId, body);
  }

  @Get('reviews/:id')
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Put('reviews/:id')
  replace(@Param('id') id: string, @Body() body: CreateReviewDto) {
    return this.reviewsService.replace(id, body);
  }

  @Patch('reviews/:id')
  update(@Param('id') id: string, @Body() body: UpdateReviewDto) {
    return this.reviewsService.update(id, body);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string): void {
    this.reviewsService.remove(id);
  }
}