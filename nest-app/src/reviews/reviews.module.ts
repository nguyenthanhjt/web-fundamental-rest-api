import { Module } from '@nestjs/common';
import { ServicesModule } from '../services/services.module.js';
import { ReviewsController } from './reviews.controller.js';
import { ReviewsService } from './reviews.service.js';
import { AuthorizationModule } from '../authorization/authorization.module.js';

@Module({
  imports: [ServicesModule, AuthorizationModule],
  controllers: [ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}