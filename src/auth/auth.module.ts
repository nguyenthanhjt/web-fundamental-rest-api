import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JWTAuthGuard } from './guards/jwt-auth.guard';
import { RolesGuard } from './guards/roles.guard';

@Global()
@Module({
  imports: [
    UsersModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const accessSecret = configService.getOrThrow<string>(
          'JWT_ACCESS_SECRET',
        );
        configService.getOrThrow<string>('JWT_REFRESH_SECRET');
        return { secret: accessSecret };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JWTAuthGuard,
    RolesGuard,
  ],
  exports: [AuthService, JWTAuthGuard, RolesGuard, JwtModule],
})
export class AuthModule {}
