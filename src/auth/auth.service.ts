import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import type { SignOptions } from 'jsonwebtoken';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { REFRESH_TOKEN_STORE } from './refresh-token/refresh-token.store';
import type { RefreshTokenStore } from './refresh-token/refresh-token.store';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @Inject(REFRESH_TOKEN_STORE)
    private readonly refreshTokenStore: RefreshTokenStore,
  ) {}

  async register(dto: RegisterDto) {
    return this.usersService.create(dto);
  }

  async login(dto: LoginDto) {
    const user = this.usersService.findByEmail(dto.email.toLowerCase());
    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string };

    try {
      payload = await this.jwtService.verifyAsync<{ sub: string }>(
        refreshToken,
        {
          secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        },
      );
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const consumed = await this.refreshTokenStore.consume(
      payload.sub,
      refreshToken,
    );

    if (!consumed) {
      await this.refreshTokenStore.revokeAllByUser(payload.sub);
      throw new UnauthorizedException('Refresh token reuse detected');
    }

    const user = this.usersService.findById(payload.sub);
    if (!user) {
      await this.refreshTokenStore.revokeAllByUser(payload.sub);
      throw new UnauthorizedException('User not found');
    }

    return this.issueTokens(user);
  }

  private async issueTokens(user: User) {
    const accessToken = await this.jwtService.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      {
        secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
        expiresIn: this.configService.get<string>(
          'JWT_ACCESS_EXPIRES_IN',
          '15m',
        ) as SignOptions['expiresIn'],
      },
    );

    const refreshExpiresIn = this.configService.get<string>(
      'JWT_REFRESH_EXPIRES_IN',
      '7d',
    );
    const refreshToken = await this.jwtService.signAsync(
      { sub: user.id },
      {
        secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
        expiresIn: refreshExpiresIn as SignOptions['expiresIn'],
        jwtid: randomUUID(),
      },
    );

    await this.refreshTokenStore.save(
      user.id,
      refreshToken,
      new Date(Date.now() + this.parseDuration(refreshExpiresIn)),
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  private parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)([smhd])$/);
    if (!match) {
      throw new Error(`Unsupported token duration: ${duration}`);
    }

    const value = Number(match[1]);
    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return value * multipliers[match[2]];
  }
}
