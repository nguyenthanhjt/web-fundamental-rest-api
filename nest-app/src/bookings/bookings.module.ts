import { Module } from '@nestjs/common';
import { BookingsController } from './bookings.controller.js';
import { BookingsService } from './bookings.service.js';
import { ServicesModule } from '../services/services.module.js';

@Module({
  controllers: [BookingsController],
  providers: [BookingsService],
  imports: [ServicesModule],
})
export class BookingsModule {}
