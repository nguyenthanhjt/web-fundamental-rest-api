import { ConflictException, Injectable, OnModuleInit } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UserRole } from './enums/user-role.enum.js';
import type { CreateUserDto } from './dto/user.dto.js';

type User = {
  id: number;
  username: string;
  passwordHash: string;
  role: UserRole;
};

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(private readonly passwordHasher: PasswordHasher) {}

  private nextUserId = 1;

  private readonly users: User[] = [];

  async onModuleInit(): Promise<void> {
    const username = process.env.ADMIN_USERNAME?.trim();
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
        return;
    }

    if (this.users.some((user) => user.username === username)) {
        return;
    }

    const passwordHash = await this.passwordHasher.hash(password);

    const admin: User = {
        id: this.nextUserId++,
        username,
        passwordHash,
        role: UserRole.ADMIN,
    };

    this.users.push(admin);
  }

  findByUsername(username: string): User | undefined {
    return this.users.find(
      (user) => user.username === username.trim(),
    );
  }

  findById(id: number): Omit<User, 'passwordHash'> | undefined {
    const user = this.users.find((item) => item.id === id);

    if (!user) {
      return undefined;
    }

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }

  async register(dto: CreateUserDto) {
    const username = dto.username.trim();

    if (this.users.some((user) => user.username === username)) {
      throw new ConflictException('Username already exists');
    }

    const passwordHash = await this.passwordHasher.hash(dto.password);

    const user: User = {
      id: this.nextUserId++,
      username,
      passwordHash,
      role: UserRole.USER,
    };

    this.users.push(user);

    return {
      id: user.id,
      username: user.username,
      role: user.role,
    };
  }
}