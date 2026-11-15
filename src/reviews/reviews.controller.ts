import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Put,
} from '@nestjs/common';
import type { PatchReviewDto } from './dto/patch-review.dto.js';
import type { UpdateReviewDto } from './dto/update-review.dto.js';
import type { Review } from './review.entity.js';
import { ReviewsService } from './reviews.service.js';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id')
  getReviewById(@Param('id') id: string): Review {
    return this.reviewsService.getReviewById(id);
  }

  @Put(':id')
  updateReview(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateReviewDto>,
  ): Review {
    return this.reviewsService.updateReview(id, dto);
  }

  @Patch(':id')
  patchReview(@Param('id') id: string, @Body() dto: PatchReviewDto): Review {
    return this.reviewsService.patchReview(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteReview(@Param('id') id: string): void {
    this.reviewsService.deleteReview(id);
  }
}
