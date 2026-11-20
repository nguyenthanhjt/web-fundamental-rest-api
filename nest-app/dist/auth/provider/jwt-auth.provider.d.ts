import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from '@nestjs/authentication';
import { UsersService } from '../../users/users.service.js';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js';
export declare class JwtAuthProvider extends JwtBearerProvider<AuthenticatedUser> {
    private readonly usersService;
    constructor(usersService: UsersService, registry: AuthenticationRegistry);
    protected validate(claims: JwtClaims): AuthenticatedUser | null;
}
