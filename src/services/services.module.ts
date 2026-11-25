import { Module } from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesController } from './services.controller';
import { ServicesRepository } from './services.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Service } from './entities/service.entity';

@Module({
  controllers: [ServicesController],
  imports: [TypeOrmModule.forFeature([Service])],
  providers: [ServicesService, ServicesRepository],
  exports: [ServicesService],
})
export class ServicesModule {}
