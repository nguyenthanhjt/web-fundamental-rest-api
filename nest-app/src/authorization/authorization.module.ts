import { Module } from '@nestjs/common';
import { AuthorizationModule as NestAuthorizationModule } from '@nestjs/authorization';
import { BookingPolicy } from './policies/booking.policy.js';
import { ReviewPolicy } from './policies/review.policy.js';

@Module({
  imports: [
    NestAuthorizationModule.forRoot({
      globalGuard: false,
    }),
  ],
  providers: [BookingPolicy, ReviewPolicy],
  exports: [NestAuthorizationModule, BookingPolicy, ReviewPolicy],
})
export class AuthorizationModule {}