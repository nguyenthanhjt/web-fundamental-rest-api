import { Module } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { UsersModule } from '../users/users.module.js';
import { AuthTokenProvider } from './provider/auth-token.provider.js';
import { JwtAuthProvider } from './provider/jwt-auth.provider.js';

@Module({
  imports: [UsersModule],
  providers: [
    AuthService,
    PasswordHasher,
    AuthTokenProvider,
    JwtAuthProvider,
  ],
  controllers: [AuthController],
})
export class AuthModule {}