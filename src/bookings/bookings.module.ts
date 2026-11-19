import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { ServicesModule } from '../services/services.module.js';

@Module({
  imports: [ServicesModule],
  controllers: [BookingsController],
  providers: [BookingsService],
})
export class BookingsModule {}
