import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service.js';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }
}
