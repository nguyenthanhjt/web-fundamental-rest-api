import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Role } from '../auth/enum/roles.enum';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UsersRepository } from './users.repository';

export type PublicUser = Omit<User, 'passwordHash'>;

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  private toPublicUser(user: User): PublicUser {
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser;
  }

  async create(createUserDto: CreateUserDto, passwordHash?: string): Promise<PublicUser> {
    const name = typeof createUserDto?.name === 'string' ? createUserDto.name.trim() : '';
    const email = typeof createUserDto?.email === 'string' ? createUserDto.email.trim().toLowerCase() : '';
    if (name.length < 1 || name.length > 120) {
      throw new BadRequestException('Name must be between 1 and 120 characters');
    }

    if (await this.usersRepository.findByEmail(email)) {
      throw new ConflictException('Email already exists');
    }

    const user = await this.usersRepository.create({
      name,
      email,
      passwordHash: passwordHash ?? null,
      role: Role.USER,
    });

    return this.toPublicUser(user);
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findByEmail(email.trim().toLowerCase());
  }

  findByEmailForAuth(email: string): Promise<User | null> {
    return this.usersRepository.findByEmailForAuth(email.trim().toLowerCase());
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findById(id);
  }

  async findAll(): Promise<PublicUser[]> {
    const users = await this.usersRepository.findAll();
    return users.map((user) => this.toPublicUser(user));
  }

  async findOne(id: number): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return this.toPublicUser(user);
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<PublicUser> {
    const currentUser = await this.findById(id);
    if (!currentUser) throw new NotFoundException('User not found');

    const data: Partial<User> = {};
    if (updateUserDto.name !== undefined) {
      const name = typeof updateUserDto.name === 'string' ? updateUserDto.name.trim() : '';
      if (name.length < 1 || name.length > 120) {
        throw new BadRequestException('Name must be between 1 and 120 characters');
      }
      data.name = name;
    }
    if (updateUserDto.email !== undefined) {
      const email = typeof updateUserDto.email === 'string' ? updateUserDto.email.trim().toLowerCase() : '';
      if (email.length > 255 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new BadRequestException('Invalid email');
      }
      const duplicate = await this.usersRepository.findByEmail(email);
      if (duplicate && duplicate.id !== id) {
        throw new ConflictException('Email already exists');
      }
      data.email = email;
    }

    if (Object.keys(data).length === 0) {
      throw new BadRequestException('At least one of name or email is required');
    }

    const updatedUser = await this.usersRepository.update(id, data);
    return this.toPublicUser(updatedUser ?? currentUser);
  }

  async remove(id: number): Promise<PublicUser> {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    await this.usersRepository.remove(id);
    return this.toPublicUser(user);
  }
}
