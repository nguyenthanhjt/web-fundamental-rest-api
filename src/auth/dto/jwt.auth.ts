import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from '@nestjs/authentication';
import type { User } from '../../users/entities/user.entity';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtAuth extends JwtBearerProvider<User> {
  constructor(
    private readonly usersService: UsersService,
    registry: AuthenticationRegistry,
  ) {
    super({ realm: 'api' });
    registry.registerProvider(this);
  }

  validate({ sub }: JwtClaims) {
    return sub ? this.usersService.findById(Number(sub)) : null;
  }
}
