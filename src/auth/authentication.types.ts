import type { User } from './user.entity';

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: User;
  }
}
