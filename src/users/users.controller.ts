import { Controller, Get } from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator.js';
import { Role } from './enums/role.enum.js';
import { UsersService } from './users.service.js';

@Controller('api/v1/users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() { return this.usersService.findAllPublic(); }
}
