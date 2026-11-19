import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service.js';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService, private readonly usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: config.getOrThrow<string>('JWT_SECRET'),
      algorithms: ['HS256'], ignoreExpiration: false,
      issuer: 'booking-api', audience: 'booking-api-client',
    });
  }

  validate(payload: { sub?: unknown; exp?: unknown; iat?: unknown }): AuthenticatedUser {
    if (!payload || typeof payload.sub !== 'string' ||
        typeof payload.exp !== 'number' || typeof payload.iat !== 'number') {
      throw new UnauthorizedException('Token không hợp lệ');
    }
    const user = this.usersService.findById(payload.sub);
    if (!user) throw new UnauthorizedException('Tài khoản không tồn tại');
    return { id: user.id, email: user.email, role: user.role };
  }
}
