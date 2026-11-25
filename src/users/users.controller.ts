import {
  Controller,
  ForbiddenException,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import { Can } from '@nestjs/authorization';
import { CurrentUser } from '@nestjs/authentication';
import type { User } from './entities/user.entity';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserPolicy } from './users.policy';
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Can(UserPolicy, 'list')
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @Can(UserPolicy, 'access', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Can(UserPolicy, 'access', (context) => [
    Number(context.switchToHttp().getRequest<{ params: { id: string } }>().params.id),
  ])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Can(UserPolicy, 'remove')
  @HttpCode(204)
  async remove(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: User) {
    if (id === user.id) {
      throw new ForbiddenException('An admin cannot delete their own account');
    }
    await this.usersService.remove(id);
  }
}
