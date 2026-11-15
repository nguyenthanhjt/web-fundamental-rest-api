import { forwardRef, Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsRepository } from './reviews.repository.js';
import { ServicesModule } from '../services/services.module.js';

@Module({
  imports: [forwardRef(() => ServicesModule)],
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
  exports: [ReviewsService]
})
export class ReviewsModule {}
