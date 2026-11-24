import { Controller, Post, UseGuards, Request, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { PublicUser } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import type RegisterAuthDto from './dto/register-auth.dto.js';
import type SecuredUser from './entities/secured-user.entity.js';

@Controller('auth')
export class AuthController {
  constructor(readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Request() req: { user: SecuredUser }) {
    return await this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() dto: Partial<RegisterAuthDto>): Promise<PublicUser> {
    return await this.authService.register(dto);
  }
}
