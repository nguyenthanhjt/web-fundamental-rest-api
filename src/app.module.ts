
import { Module } from '@nestjs/common';

import {APP_FILTER,APP_INTERCEPTOR,} from '@nestjs/core';
import { BookingsModule } from './bookings/bookings.module.js';
import { ServicesModule } from './services/services.module.js';
import { ReviewsModule } from './reviews/reviews.module.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';
import { ResponseInterceptor } from './common/interceptors/response.interceptor.js';
@Module({
  imports: [
    ServicesModule,
    BookingsModule,
    ReviewsModule,
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
  ],
})
export class AppModule {}
