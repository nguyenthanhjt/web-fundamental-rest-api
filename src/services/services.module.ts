import { forwardRef, Module } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { ServicesController } from './services.controller.js';
import { ReviewsModule } from '../reviews/reviews.module.js';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity.js';

@Module({
  imports: [forwardRef(() => ReviewsModule), TypeOrmModule.forFeature([Service])],
  controllers: [ServicesController],
  providers: [ServicesService],
  exports: [ServicesService]
})
export class ServicesModule {}
