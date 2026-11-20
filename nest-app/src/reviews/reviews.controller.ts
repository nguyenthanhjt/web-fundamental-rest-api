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
import { CurrentUser, Public } from '@nestjs/authentication';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';

@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('services/:serviceId/reviews')
  @Public()
  findByService(@Param('serviceId') serviceId: string) {
    return this.reviewsService.findByServiceId(serviceId);
  }

  @Post('services/:serviceId/reviews')
  create(
    @Param('serviceId') serviceId: string,
    @Body() body: CreateReviewDto,
    @CurrentUser() user: AuthenticatedUser
  ) {
    return this.reviewsService.create(serviceId, body, user.id);
  }

  @Get('reviews/:id')
  @Public()
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOne(id);
  }

  @Put('reviews/:id')
  replace(@Param('id') id: string, @Body() body: CreateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.replace(id, body, user);
  }

  @Patch('reviews/:id')
  update(@Param('id') id: string, @Body() body: UpdateReviewDto, @CurrentUser() user: AuthenticatedUser) {
    return this.reviewsService.update(id, body, user);
  }

  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string, @CurrentUser() user: AuthenticatedUser): Promise<void> {
    await this.reviewsService.remove(id, user);
  }
}