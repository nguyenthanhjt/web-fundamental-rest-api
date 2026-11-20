import { Module } from '@nestjs/common';
import { AuthenticationModule } from '@nestjs/authentication';
import { AuthorizationModule } from '@nestjs/authorization';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthProvider } from './jwt-auth.provider';
import { AccountPolicy, BookingPolicy, ReviewPolicy } from './policies';
import { RefreshTokenEntity, RefreshTokenFamilyEntity } from './refresh-token.entity';
import { TypeOrmRefreshTokenStore } from './typeorm-refresh-token.store';
import { User } from './user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RefreshTokenEntity, RefreshTokenFamilyEntity]),
    AuthenticationModule.forRoot({
      accessToken: { key: process.env.JWT_ACCESS_SECRET ?? 'development-only-secret-must-be-at-least-32-bytes', ttl: '15m' },
      refreshToken: { ttl: '30d', absoluteTtl: '90d' },
    }),
    AuthorizationModule.forRoot({ globalGuard: true, policies: [BookingPolicy, ReviewPolicy, AccountPolicy] }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthProvider, TypeOrmRefreshTokenStore, BookingPolicy, ReviewPolicy, AccountPolicy],
})
export class AuthModule {}
