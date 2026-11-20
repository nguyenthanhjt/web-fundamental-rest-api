import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ServicesModule } from '../services/services.module';

@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService],
  imports: [ServicesModule],
})
export class ReviewsModule {}
