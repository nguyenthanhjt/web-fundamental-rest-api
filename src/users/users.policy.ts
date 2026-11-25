import { Policy, type PolicyBefore } from '@nestjs/authorization';
import { Role } from '../auth/enum/roles.enum';
import type { User } from './entities/user.entity';

@Policy()
export class UserPolicy implements PolicyBefore<User> {
  before(user: User | null) {
    if (user?.role === Role.ADMIN) return true;
  }

  list(_user: User | null)   { return false; }
  remove(_user: User | null) { return false; }

  access(user: User | null, targetId: number) {
    return !!user && user.id === targetId;
  }
}
