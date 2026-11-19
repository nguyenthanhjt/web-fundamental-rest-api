import { Injectable, OnModuleInit, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'node:crypto';
import { UsersService } from '../users/users.service.js';
import type { RegisterDto } from './dto/register.dto.js';
import type { LoginDto } from './dto/login.dto.js';

@Injectable()
export class AuthService implements OnModuleInit {
  private dummyPasswordHash!: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async onModuleInit(): Promise<void> {
    this.dummyPasswordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
  }

  async register(dto: RegisterDto) {
    const hash = await bcrypt.hash(dto.password, 12);
    const { id, email, role, createdAt } = this.usersService.create(dto.email, hash);
    return { id, email, role, createdAt };
  }

  async login(dto: LoginDto) {
    const user = this.usersService.findByEmail(dto.email);
    // Perform the same expensive check even when the email does not exist.
    const matches = await bcrypt.compare(dto.password, user?.passwordHash ?? this.dummyPasswordHash);
    if (!user || !matches) {
      throw new UnauthorizedException('Email hoặc mật khẩu không đúng');
    }
    const token = await this.jwtService.signAsync({ sub: user.id, role: user.role });
    return { access_token: token, token_type: 'Bearer', expires_in: 900 };
  }
}
