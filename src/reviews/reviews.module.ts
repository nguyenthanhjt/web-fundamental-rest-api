import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module';
import { ReviewService } from './reviews.service';
import { ReviewsController, ServiceReviewsController } from './reviews.controller';

@Module({
  imports: [ServicesModule],
  controllers: [ServiceReviewsController, ReviewsController],
  providers: [ReviewService],
})
export class ReviewsModule {}
