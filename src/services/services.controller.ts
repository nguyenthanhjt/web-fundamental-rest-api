import { Controller, Get, Param } from '@nestjs/common';
import { Service } from './service.model';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll(): Service[] {
    return this.servicesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string): Service {
    return this.servicesService.findOne(id);
  }
}
