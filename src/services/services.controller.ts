import { Controller, Get, Param } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { Service } from './service.model';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(private readonly servicesService: ServicesService) {}

  @Get()
  @Public()
  findAll(): Service[] {
    return this.servicesService.findAll();
  }

  @Get(':id')
  @Public()
  findOne(@Param('id') id: string): Service {
    return this.servicesService.findOne(id);
  }
}
