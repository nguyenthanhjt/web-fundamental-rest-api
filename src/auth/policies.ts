import { Policy } from '@nestjs/authorization';
import { User, UserRole } from './user.entity';

@Policy()
export class BookingPolicy {
  access(user: User | null): boolean { return user !== null; }
  delete(user: User | null): boolean { return user?.role === UserRole.ADMIN; }
}

@Policy()
export class ReviewPolicy {
  write(user: User | null): boolean { return user !== null; }
  delete(user: User | null): boolean { return user?.role === UserRole.ADMIN; }
}

@Policy()
export class AccountPolicy {
  authenticated(user: User | null): boolean { return user !== null; }
}
