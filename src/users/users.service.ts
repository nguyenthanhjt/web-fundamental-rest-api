import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entity/users.entity.js';
import { Repository } from 'typeorm';
import { isNumber } from 'class-validator';
import { error } from 'console';
import { PasswordHasher } from '@nestjs/authentication';

@Injectable()
export class UsersService 
{
    constructor(@InjectRepository(User) private readonly usersRepo: Repository<User>, private readonly passwordHasher: PasswordHasher) {}

    async findOne(id: number) {
        const user = await this.usersRepo.findOneBy({id});

        if (!user)
            throw new NotFoundException('user not found');

        return user;
    }

    async findOneByEmail(email: string) {

        const user = await this.usersRepo.findOneBy({email});

        if (!user)
            throw new NotFoundException('user not found');

        return user;
    }

    async createUser(name: string, email: string, password: string) {
        if (await this.usersRepo.findOneBy({email})) {
            throw new BadRequestException('email already exist');
        }

        const hashPassword = await this.passwordHasher.hash(password);

        const newUser = await this.usersRepo.create({
            name,
            email,
            hashPassword
        });

        return await this.usersRepo.save(newUser);
    }
}
