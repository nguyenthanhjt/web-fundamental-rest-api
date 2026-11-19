import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { SignInDto } from './dto/sign-in.dto.js';
import { Public } from '@nestjs/authentication';
import { SignUpDto } from './dto/sign-up.dto.js';
import { UsersService } from '../users/users.service.js';

@Public()
@Controller('api/v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService, private readonly usersService: UsersService) {}

  @Post('sign-in') 
  async signIn(@Body() body: SignInDto) {
    return await this.authService.signIn(body.email, body.password);
  }

  @Post('sign-up')
  async signUp(@Body() body: SignUpDto) {
    return await this.usersService.createUser(body.name, body.email, body.password);
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(@Body() refreshToken: string) {
    return await this.authService.refreshToken(refreshToken);
  }
}
