import { Controller, Get, Param } from '@nestjs/common';
import { ServicesService } from './services.service.js';
import { Public } from '@nestjs/authentication';

@Controller('services')
export class ServicesController {
    constructor(private readonly servicesService: ServicesService) {}

    @Get()
    @Public()
    findAll() {
        return this.servicesService.findAll();
    }

    @Get(':id')
    @Public()
    findOne(@Param('id') id: string) {
        return this.servicesService.findOne(id);
    }
}
