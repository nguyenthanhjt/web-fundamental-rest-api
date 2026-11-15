import { Controller, Get, Param } from '@nestjs/common';
import { ServicesService } from './services.service.js';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  getAllServices() {
    return this.servicesService.getAllServices();
  }

  @Get(':id')
  getServiceById(@Param('id') id: string) {
    return this.servicesService.getServiceById(id);
  }
}
