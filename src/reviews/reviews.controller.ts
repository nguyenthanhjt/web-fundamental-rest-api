import { Controller, Get, Post, Body, Patch, Param, Delete, Put, HttpCode, HttpStatus } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { PatchReviewDto, UpdateReviewDto } from './dto/update-review.dto.js';

@Controller('api/v1/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.reviewsService.findById(id);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReviewDto: UpdateReviewDto) {
    return await this.reviewsService.update(id, updateReviewDto);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() updateReviewDto: PatchReviewDto) {
    return await this.reviewsService.patch(id, updateReviewDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.reviewsService.remove(id);
  }
}
