import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
} from '@nestjs/common';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ReviewsService } from './reviews.service';

@Controller('api/v1')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('services/:serviceId/reviews')
  getAllReviews(@Param('serviceId') serviceId: string) {
    return this.reviewsService.getAllReviews(serviceId);
  }

  @Get('reviews/:id')
  getReview(@Param('id') id: string) {
    return this.reviewsService.getReview(id);
  }

  @Patch('reviews/:id')
  updateReview(@Param('id') id: string, @Body() body: UpdateReviewDto) {
    return this.reviewsService.updateReview(id, body);
  }

  @Delete('reviews/:id')
  deleteReview(@Param('id') id: string): string {
    return this.reviewsService.deleteReview(id);
  }

  @Put('reviews/:id')
  replaceReview(@Param('id') id: string, @Body() body: CreateReviewDto) {
    return this.reviewsService.replaceReview(id, body);
  }

  @Post('services/:serviceId/reviews')
  createReview(
    @Param('serviceId') serviceId: string,
    @Body() body: CreateReviewDto,
  ) {
    return this.reviewsService.createReview(serviceId, body);
  }
}
