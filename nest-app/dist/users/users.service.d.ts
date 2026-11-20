import { OnModuleInit } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UserRole } from './enums/user-role.enum.js';
import type { CreateUserDto } from './dto/user.dto.js';
type User = {
    id: number;
    username: string;
    passwordHash: string;
    role: UserRole;
};
export declare class UsersService implements OnModuleInit {
    private readonly passwordHasher;
    constructor(passwordHasher: PasswordHasher);
    private nextUserId;
    private readonly users;
    onModuleInit(): Promise<void>;
    findByUsername(username: string): User | undefined;
    findById(id: number): Omit<User, 'passwordHash'> | undefined;
    register(dto: CreateUserDto): Promise<{
        id: number;
        username: string;
        role: UserRole;
    }>;
}
export {};
