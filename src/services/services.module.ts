import { Module } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { ServicesController } from './services.controller.js';

@Module({
  providers: [ServicesService],
  controllers: [ServicesController],
  exports: [ServicesService],
})
export class ServicesModule {}
