import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { isPasswordMatch } from '../common/password.util.js';
import { UsersService, type PublicUser } from '../users/users.service.js';
import type RegisterAuthDto from './dto/register-auth.dto.js';
import type SecuredUser from './entities/secured-user.entity.js';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== '';
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(securedUser: SecuredUser) {
    const payload = {
      username: securedUser.username,
      role: securedUser.role,
      sub: securedUser.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(dto: Partial<RegisterAuthDto>): Promise<PublicUser> {
    const body = dto ?? {};
    if (!isNonEmptyString(body.username) || !isNonEmptyString(body.password)) {
      throw new BadRequestException('username and password are required');
    }

    return await this.usersService.create(
      body.username.trim(),
      body.password,
    );
  }

  async validateUser(
    username: string,
    password: string,
  ): Promise<SecuredUser | null> {
    const user = this.usersService.findByUsername(username);
    if (!user || !(await isPasswordMatch(password, user.password))) {
      return null;
    }

    return {
      username: user.username,
      id: user.id,
      role: user.role,
    };
  }
}
