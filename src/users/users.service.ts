import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'node:crypto';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { createUsersMock } from '../mock-data/users.mock';
import { Role} from '../auth/enums/role.enum';
import { REFRESH_TOKEN_STORE } from '../auth/refresh-token/refresh-token.store';
import type { RefreshTokenStore } from '../auth/refresh-token/refresh-token.store';
export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService implements OnModuleInit {
  private users: User[] = [];

  constructor(
    @Inject(REFRESH_TOKEN_STORE)
    private readonly refreshTokenStore: RefreshTokenStore,
  ) {}

  private toPublicUser(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async onModuleInit(): Promise<void> {
    this.users = await createUsersMock();
  }
  async create(createUserDto: CreateUserDto): Promise<PublicUser> {
    const email = createUserDto.email.trim().toLowerCase();
    if (this.findByEmail(email)) {
      throw new ConflictException('Email already exists');
    }

    const user: User = {
      id: randomUUID(),
      name: createUserDto.name,
      email,
      passwordHash: await bcrypt.hash(createUserDto.password, 10),
      role: Role.User,
      createdAt: new Date(),
    };

    this.users.push(user);
    return this.toPublicUser(user);
  }

  findByEmail(email: string): User | undefined {
    return this.users.find((u) => u.email === email);
  }

  findById(id: string): User | undefined {
    return this.users.find((u) => u.id === id);
  }

  findAll(): PublicUser[] {
    return this.users.map((user) => this.toPublicUser(user));
  }

  findOne(id: string): PublicUser {
    const user = this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return this.toPublicUser(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<PublicUser> {
    const user = this.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const { password, name, email } = updateUserDto;
    let passwordChanged = false;

    if (name !== undefined) {
      user.name = name;
    }

    if (email !== undefined) {
      const normalizedEmail = email.trim().toLowerCase();
      const duplicate = this.users.find(
        (item) => item.id !== id && item.email === normalizedEmail,
      );
      if (duplicate) {
        throw new ConflictException('Email already exists');
      }
      user.email = normalizedEmail;
    }

    if (password !== undefined) {
      user.passwordHash = await bcrypt.hash(password, 10);
      passwordChanged = true;
    }

    if (passwordChanged) {
      await this.refreshTokenStore.revokeAllByUser(user.id);
    }

    return this.toPublicUser(user);
  }

  remove(id: string): PublicUser {
    const index = this.users.findIndex((user) => user.id === id);
    if (index === -1) {
      throw new NotFoundException('User not found');
    }
    const user = this.users.splice(index, 1)[0];
    return this.toPublicUser(user);
  }
}
