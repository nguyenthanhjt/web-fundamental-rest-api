import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { PasswordHasher, TokenService } from '@nestjs/authentication';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from './user.entity';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
}

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    private readonly tokens: TokenService,
    private readonly passwords: PasswordHasher,
  ) {}

  async register(input: RegisterDto): Promise<AuthTokens> {
    const email = input.email.toLowerCase();
    if (await this.users.findOneBy({ email })) {
      throw new ConflictException('Email is already registered');
    }
    const user = this.users.create({ email, passwordHash: await this.passwords.hash(input.password) });
    await this.users.save(user);
    return this.issueTokens(user);
  }

  async login(input: LoginDto): Promise<AuthTokens> {
    const user = await this.users.findOneBy({ email: input.email.toLowerCase() });
    if (!user || !(await this.passwords.verify(input.password, user.passwordHash))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.issueTokens(user);
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    return this.toResponse(await this.tokens.refresh(refreshToken));
  }

  async logout(userId: string): Promise<void> {
    await this.tokens.revokeAll(userId);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    return this.toResponse(await this.tokens.issue(user.id, { claims: { email: user.email }, method: 'password' }));
  }

  private toResponse(tokens: { accessToken: string; refreshToken: string; expiresIn: number }): AuthTokens {
    return { accessToken: tokens.accessToken, refreshToken: tokens.refreshToken, accessTokenExpiresIn: tokens.expiresIn };
  }
}
