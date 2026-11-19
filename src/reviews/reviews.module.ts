import { forwardRef, Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';
import { ServicesModule } from '../services/services.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity.js';

@Module({
  imports: [forwardRef(() => ServicesModule), TypeOrmModule.forFeature([Review])],
  controllers: [ReviewsController],
  providers: [ReviewsService],
  exports: [ReviewsService]
})
export class ReviewsModule {}
