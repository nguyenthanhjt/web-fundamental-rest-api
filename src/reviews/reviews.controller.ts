
import { Controller, Get, Param, Put, Post,Delete,HttpCode,HttpStatus,Body,Patch,} from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import type { Review } from './review.interface.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { ReplaceReviewDto } from './dto/replace-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';

@Controller('api/v1')
export class ReviewsController {
  constructor(
    private readonly reviewService: ReviewsService,
  ) {}


  @Get('services/:serviceId/reviews')
  findByServiceId(
    @Param('serviceId') serviceId: string,
  ): Review[] {
    return this.reviewService.findByServiceId(serviceId);
  }


  @Post('services/:serviceId/reviews')
  @HttpCode(HttpStatus.CREATED)
  create(
    @Param('serviceId') serviceId: string,
    @Body() body: CreateReviewDto,
  ): Review {
    return this.reviewService.create(serviceId, body);
  }
  @Get('reviews')
  findAll(): Review[] {
    return this.reviewService.findAll();
  }
  @Get('reviews/:id')
  findOne(
    @Param('id') id: string,
  ): Review {
    return this.reviewService.findById(id);
  }
  @Put('reviews/:id')
  replace(
    @Param('id') id: string,
    @Body() body: ReplaceReviewDto,
  ): Review {
    return this.reviewService.replace(id, body);
  }
  @Patch('reviews/:id')
  update(
    @Param('id') id: string,
    @Body() body: UpdateReviewDto,
  ): Review {
    return this.reviewService.update(id, body);
  }
  @Delete('reviews/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  delete(
    @Param('id') id: string,
  ): void {
    this.reviewService.delete(id);
  }
}
