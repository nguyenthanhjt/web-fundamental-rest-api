import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import { AuthTokenProvider } from './provider/auth-token.provider.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordHasher: PasswordHasher,
    private readonly authTokenProvider: AuthTokenProvider,
  ) {}

  async login(dto: LoginDto) {
    const user = this.usersService.findByUsername(dto.username);

    if (!user) {
      throw new UnauthorizedException(
        'Username or password is incorrect',
      );
    }

    const valid = await this.passwordHasher.verify(
      dto.password,
      user.passwordHash,
    );

    if (!valid) {
      throw new UnauthorizedException(
        'Username or password is incorrect',
      );
    }

    return this.authTokenProvider.issue(user);
  }
}