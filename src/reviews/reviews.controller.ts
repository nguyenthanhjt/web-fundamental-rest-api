import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { PatchReviewDto, UpdateReviewDto } from './dto/update-review.dto.js';
import { CurrentUser, Public } from '@nestjs/authentication';
import { User } from '../users/entity/users.entity.js';

@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Public()
  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.reviewsService.convertToReviewResponse(await this.reviewsService.findOne(id));
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.convertToReviewResponse(await this.reviewsService.update(id, updateReviewDto, user.id));
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() updateReviewDto: PatchReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.convertToReviewResponse(await this.reviewsService.patch(id, updateReviewDto, user.id));
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: User) {
    await this.reviewsService.remove(id, user.id);
  }
}
