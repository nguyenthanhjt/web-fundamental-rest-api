import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '../auth/decorators/public.decorator.js';
import { ServicesService } from './services.service.js';

@Public()
@Controller('api/v1/services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  findAll() { return this.servicesService.findAll(); }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.servicesService.findById(id); }
}
