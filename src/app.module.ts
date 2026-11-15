import { Module } from '@nestjs/common';
import { BookingsModule } from './bookings/bookings.module';
import { ReviewsModule } from './reviews/reviews.module';
import { ServicesModule } from './services/services.module';

@Module({
  imports: [ServicesModule, BookingsModule, ReviewsModule],
})
export class AppModule {}
