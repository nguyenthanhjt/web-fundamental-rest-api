import { Controller, Get, Param } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { User } from './entity/users.entity.js';
import { UserResponseDto } from './dto/user-response.dto.js';
import { CurrentUser } from '@nestjs/authentication';

@Controller('api/v1/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  private convertToUserResponse(user: User) {
    return Object.assign(new UserResponseDto(), user);
  }

  @Get()
  async findOne(@CurrentUser() user: User) {
    return this.convertToUserResponse(await this.usersService.findOne(user.id));
  }
}
