import { forwardRef, Module } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { ServicesController } from './services.controller.js';
import { ServicesRepository } from './services.repository.js';
import { ReviewsModule } from '../reviews/reviews.module.js';

@Module({
  imports: [forwardRef(() => ReviewsModule)],
  controllers: [ServicesController],
  providers: [ServicesService, ServicesRepository],
  exports: [ServicesService]
})
export class ServicesModule {}
