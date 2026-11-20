import { Controller, Get, Param } from '@nestjs/common';
import type { Service } from './service.entity.js';
import { ServicesService } from './services.service.js';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  getAllServices(): Service[] {
    return this.servicesService.getAllServices();
  }

  @Get(':id')
  getServiceById(@Param('id') id: string): Service {
    return this.servicesService.getServiceById(id);
  }
}
