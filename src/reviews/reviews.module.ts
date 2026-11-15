import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { ServiceReviewsController } from './service-reviews.controller.js';

@Module({
  imports: [ServicesModule],
  controllers: [ReviewsController, ServiceReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}
