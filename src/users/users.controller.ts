import { Controller, Get, Param, Request } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { Auth } from '../auth/decorators/auth.decorator.js';
import type SecuredUser from '../auth/entities/secured-user.entity.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Auth('ADMIN')
  getAllUsers() {
    return this.usersService.findAllPublic();
  }

  @Auth('ADMIN', 'USER')
  @Get('me')
  getCurrentUser(@Request() req: { user: SecuredUser }) {
    return this.usersService.findPublicById(req.user.id);
  }

  @Auth('ADMIN')
  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findPublicById(id);
  }
}
