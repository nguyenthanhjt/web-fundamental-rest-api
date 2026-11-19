import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service.js';
import { PasswordHasher, TokenService } from '@nestjs/authentication';

@Injectable()
export class AuthService 
{
    constructor(private readonly usersService: UsersService, private readonly tokenService: TokenService, private readonly passwordHasher: PasswordHasher) {}

    async signIn(email: string, password: string) {
        const user = await this.usersService.findOneByEmail(email);

        const passwordVerify = await this.passwordHasher.verify(password, (await this.usersService.findOneByEmail(email))?.hashPassword);

        if (!user || !passwordVerify)
            throw new BadRequestException('Wrong credentials');

        return this.tokenService.issue(user.id.toString(), { method: 'password', claims: {username: user.name}});
    }

    async refreshToken(refreshToken: string) {
        return this.tokenService.refresh(refreshToken);
    }
}
