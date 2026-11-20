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
  Request,
} from '@nestjs/common';
import { Auth } from '../auth/decorators/auth.decorator.js';
import type SecuredUser from '../auth/entities/secured-user.entity.js';
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

  @Auth('USER', 'ADMIN')
  @Put(':id')
  updateReview(
    @Param('id') id: string,
    @Body() dto: Partial<UpdateReviewDto>,
    @Request() req: { user: SecuredUser },
  ): Review {
    return this.reviewsService.updateReview(id, dto, req.user);
  }

  @Auth('USER', 'ADMIN')
  @Patch(':id')
  patchReview(
    @Param('id') id: string,
    @Body() dto: PatchReviewDto,
    @Request() req: { user: SecuredUser },
  ): Review {
    return this.reviewsService.patchReview(id, dto, req.user);
  }

  @Auth('USER', 'ADMIN')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  deleteReview(
    @Param('id') id: string,
    @Request() req: { user: SecuredUser },
  ): void {
    this.reviewsService.deleteReview(id, req.user);
  }
}
