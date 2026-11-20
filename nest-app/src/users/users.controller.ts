import { Body, Controller, Post } from '@nestjs/common';
import { Public } from '@nestjs/authentication';
import { CreateUserDto } from './dto/user.dto.js';
import { UsersService } from './users.service.js';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @Public()
  register(@Body() dto: CreateUserDto) {
    return this.usersService.register(dto);
  }
}