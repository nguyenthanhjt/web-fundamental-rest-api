var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { ConflictException, Injectable } from '@nestjs/common';
import { PasswordHasher } from '@nestjs/authentication';
import { UserRole } from './enums/user-role.enum.js';
let UsersService = class UsersService {
    passwordHasher;
    constructor(passwordHasher) {
        this.passwordHasher = passwordHasher;
    }
    nextUserId = 1;
    users = [];
    async onModuleInit() {
        const username = process.env.ADMIN_USERNAME?.trim();
        const password = process.env.ADMIN_PASSWORD;
        if (!username || !password) {
            return;
        }
        if (this.users.some((user) => user.username === username)) {
            return;
        }
        const passwordHash = await this.passwordHasher.hash(password);
        const admin = {
            id: this.nextUserId++,
            username,
            passwordHash,
            role: UserRole.ADMIN,
        };
        this.users.push(admin);
    }
    findByUsername(username) {
        return this.users.find((user) => user.username === username.trim());
    }
    findById(id) {
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
    async register(dto) {
        const username = dto.username.trim();
        if (this.users.some((user) => user.username === username)) {
            throw new ConflictException('Username already exists');
        }
        const passwordHash = await this.passwordHasher.hash(dto.password);
        const user = {
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
};
UsersService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [PasswordHasher])
], UsersService);
export { UsersService };
//# sourceMappingURL=users.service.js.map