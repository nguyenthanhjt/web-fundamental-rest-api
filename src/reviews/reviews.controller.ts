import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Put,
  Param,
} from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { Can } from '@nestjs/authorization';
import { ReviewPolicy } from '../auth/policies';
import { Review } from './review.model';
import { ReviewService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplaceReviewDto } from './dto/replace-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@Controller('services/:serviceId/reviews')
export class ServiceReviewsController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @Public()
  findForService(@Param('serviceId') serviceId: string): Review[] {
    return this.reviewService.findForService(serviceId);
  }

  @Post()
  @Can(ReviewPolicy, 'write')
  create(
    @Param('serviceId') serviceId: string,
    @Body() body: CreateReviewDto,
  ): Review {
    return this.reviewService.create(serviceId, body);
  }
}

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Review {
    return this.reviewService.findOne(id);
  }

  @Put(':id')
  @Can(ReviewPolicy, 'write')
  replace(
    @Param('id') id: string,
    @Body() body: ReplaceReviewDto,
  ): Review {
    return this.reviewService.replace(id, body);
  }

  @Patch(':id')
  @Can(ReviewPolicy, 'write')
  update(
    @Param('id') id: string,
    @Body() body: UpdateReviewDto,
  ): Review {
    if (
      body.authorName === undefined &&
      body.rating === undefined &&
      body.comment === undefined
    ) {
      throw new BadRequestException(
        'At least one of authorName, rating, comment is required',
      );
    }
    return this.reviewService.update(id, body);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Can(ReviewPolicy, 'delete')
  remove(@Param('id') id: string): void {
    this.reviewService.remove(id);
  }
}
