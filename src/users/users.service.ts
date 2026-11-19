import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { isEmail } from 'class-validator';
import { randomUUID } from 'node:crypto';
import * as bcrypt from 'bcrypt';
import { Role } from './enums/role.enum.js';
import type { User } from './interfaces/user.interface.js';

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly users: User[] = [];

  constructor(private readonly config: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const email = this.config.get<string>('ADMIN_EMAIL');
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email && !password) return;
    if (!email || !password || !isEmail(email.trim()) || email.trim().length > 254 ||
        password.length < 8 || Buffer.byteLength(password, 'utf8') > 72) {
      throw new Error('Cấu hình ADMIN_EMAIL và ADMIN_PASSWORD không hợp lệ');
    }
    // Bootstrap only from trusted server configuration; registration always creates USER.
    const user = this.create(email, await bcrypt.hash(password, 12));
    user.role = Role.ADMIN;
  }

  findByEmail(email: string): User | undefined {
    return this.users.find(user => user.email === email.trim().toLowerCase());
  }

  findById(id: string): User | undefined {
    return this.users.find(user => user.id === id);
  }

  create(email: string, passwordHash: string): User {
    const normalizedEmail = email.trim().toLowerCase();
    if (this.findByEmail(normalizedEmail)) {
      throw new ConflictException('Email đã được sử dụng');
    }
    const now = new Date();
    const user: User = {
      id: randomUUID(), email: normalizedEmail, passwordHash,
      role: Role.USER, createdAt: now, updatedAt: now,
    };
    this.users.push(user);
    return user;
  }

  findAllPublic() {
    return this.users.map(({ id, email, role, createdAt, updatedAt }) =>
      ({ id, email, role, createdAt, updatedAt }));
  }
}
