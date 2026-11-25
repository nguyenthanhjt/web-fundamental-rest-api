import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeepPartial, Repository } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}

  async create(data: DeepPartial<User>): Promise<User> {
    return this.repository.save(this.repository.create(data));
  }

  findAll(): Promise<User[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }

  findById(id: User['id']): Promise<User | null> {
    return this.repository.findOne({ where: { id } });
  }

  findByEmail(email: string): Promise<User | null> {
    return this.repository.findOne({ where: { email } });
  }

  findByEmailForAuth(email: string): Promise<User | null> {
    return this.repository
      .createQueryBuilder('user')
      .addSelect('user.passwordHash')
      .where('user.email = :email', { email })
      .getOne();
  }

  async update(id: User['id'], data: DeepPartial<User>): Promise<User | null> {
    const user = await this.repository.preload(Object.assign({ id }, data));
    return user ? this.repository.save(user) : null;
  }

  async remove(id: User['id']): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
