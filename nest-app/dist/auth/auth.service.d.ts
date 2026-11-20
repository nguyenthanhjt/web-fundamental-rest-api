import { PasswordHasher } from '@nestjs/authentication';
import { UsersService } from '../users/users.service.js';
import type { LoginDto } from './dto/login.dto.js';
import { AuthTokenProvider } from './provider/auth-token.provider.js';
export declare class AuthService {
    private readonly usersService;
    private readonly passwordHasher;
    private readonly authTokenProvider;
    constructor(usersService: UsersService, passwordHasher: PasswordHasher, authTokenProvider: AuthTokenProvider);
    login(dto: LoginDto): Promise<import("@nestjs/authentication").TokenPair>;
}
