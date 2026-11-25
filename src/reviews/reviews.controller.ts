import { Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Put } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplaceReviewDto } from './dto/replace-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { ReviewsService } from './reviews.service';
import { ReviewPolicy } from './reviews.policy';
import { Can } from '@nestjs/authorization';
import { CurrentUser, Public } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity';
@Controller()
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get('services/:serviceId/reviews')
  @Public()
  findAll(@Param('serviceId', ParseIntPipe) serviceId: number) { return this.reviewsService.findByService(serviceId); }

  @Post('services/:serviceId/reviews')
  @Can(ReviewPolicy, 'create')
  create(@Param('serviceId', ParseIntPipe) serviceId: number, @Body() dto: CreateReviewDto, @CurrentUser() user: User) {
    return this.reviewsService.create(serviceId, dto, user.id);
  }

  @Get('reviews/:id')
  @Public()
  findOne(@Param('id', ParseIntPipe) id: number) { return this.reviewsService.findOne(id); }

  @Put('reviews/:id')
  @Can(ReviewPolicy, 'update', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  replace(@Param('id', ParseIntPipe) id: number, @Body() dto: ReplaceReviewDto) {
    return this.reviewsService.replace(id, dto);
  }

  @Patch('reviews/:id')
  @Can(ReviewPolicy, 'update', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete('reviews/:id')
  @Can(ReviewPolicy, 'remove', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  @HttpCode(204)
  remove(@Param('id', ParseIntPipe) id: number) { return this.reviewsService.remove(id); }
}
