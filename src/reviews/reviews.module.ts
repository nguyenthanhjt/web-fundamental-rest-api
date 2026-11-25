import { Module } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { ReviewsController } from './reviews.controller';
import { ServicesModule } from '../services/services.module';
import { ReviewsRepository } from './reviews.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from './entities/review.entity';
import { ReviewPolicy } from './reviews.policy';
import { Booking } from '../bookings/entities/booking.entity';
@Module({
  controllers: [ReviewsController],
  providers: [ReviewsService, ReviewsRepository, ReviewPolicy],
  imports: [ServicesModule, TypeOrmModule.forFeature([Review, Booking])],
})
export class ReviewsModule {}
