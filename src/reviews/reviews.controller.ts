import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Put } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReplaceReviewDto } from './dto/replace-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { Public } from '../auth/decorators/public.decorator.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';

@Controller('api/v1')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewsService) {}

  @Public()
  @Get('services/:serviceId/reviews')
  findByServiceId(@Param('serviceId') serviceId: string) {
    return this.reviewService.findByServiceId(serviceId);
  }

  @Post('services/:serviceId/reviews')
  create(@Param('serviceId') serviceId: string, @Body() body: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewService.create(serviceId, body, user);
  }

  @Public()
  @Get('reviews')
  findAll() { return this.reviewService.findAll(); }

  @Public()
  @Get('reviews/:id')
  findOne(@Param('id') id: string) { return this.reviewService.findById(id); }

  @Put('reviews/:id')
  replace(@Param('id') id: string, @Body() body: ReplaceReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewService.replace(id, body, user);
  }

  @Patch('reviews/:id')
  update(@Param('id') id: string, @Body() body: UpdateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewService.update(id, body, user);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser) {
    this.reviewService.delete(id, user);
  }
}
