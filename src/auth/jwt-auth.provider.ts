import { Injectable } from '@nestjs/common';
import { AuthenticationRegistry, JwtBearerProvider, type JwtClaims } from '@nestjs/authentication';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';

@Injectable()
export class JwtAuthProvider extends JwtBearerProvider<User> {
  constructor(@InjectRepository(User) private readonly users: Repository<User>, registry: AuthenticationRegistry) {
    super();
    registry.registerProvider(this);
  }

  protected validate(claims: JwtClaims): Promise<User | null> {
    return claims.sub ? this.users.findOneBy({ id: claims.sub }) : Promise.resolve(null);
  }
}
