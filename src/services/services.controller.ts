import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ServicesService } from './services.service';
import { Can } from '@nestjs/authorization';
@Controller('services')
export class ServicesController {
  constructor(private readonly services: ServicesService) { }

  @Get()
  @Can.Anyone()
  findAll() {
    return this.services.findAll();
  }
  @Can.Anyone()
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.services.findOne(id);
  }
}
