import { Policy } from '@nestjs/authorization';
import type { Review } from '../../reviews/reviews.service.js';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js';
import { UserRole } from '../../users/enums/user-role.enum.js';

@Policy()
export class ReviewPolicy {
  update(user: AuthenticatedUser, review: Review): boolean {
    return user.role === UserRole.ADMIN || review.authorId === user.id;
  }

  delete(user: AuthenticatedUser, review: Review): boolean {
    return this.update(user, review);
  }
}