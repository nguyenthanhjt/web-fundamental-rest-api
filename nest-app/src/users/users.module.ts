import { Module } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  providers: [UsersService, PasswordHasher],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}