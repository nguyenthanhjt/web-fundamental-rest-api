import { Body, Controller, Get, HttpCode, Post } from '@nestjs/common';
import { CurrentUser, Public } from '@nestjs/authentication';
import type { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RegisterDto } from './dto/register.dto';
import { Can } from '@nestjs/authorization';
import type { PublicUser } from '../users/users.service';
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public() @Post('register')
  register(@Body() dto: RegisterDto) { return this.authService.register(dto); }

  @Public() @Post('login') @HttpCode(200)
  login(@Body() dto: LoginDto) { return this.authService.login(dto); }

  @Public() @Post('refresh') @HttpCode(200)
  refresh(@Body() dto: RefreshTokenDto) { return this.authService.refresh(dto.refreshToken); }

  @Public() @Post('logout') @HttpCode(204)
  logout(@Body() dto: RefreshTokenDto) { return this.authService.logout(dto.refreshToken); }

  @Get('me')
  @Can.Anyone()
  me(@CurrentUser() user: User): PublicUser  { 
    const { passwordHash: _passwordHash, ...publicUser } = user;
    return publicUser ; 
  }
}
