import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuth } from './dto/jwt.auth';

@Module({
  imports: [
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [JwtAuth, AuthService],
  exports: [AuthService],
})
export class AuthModule {}
