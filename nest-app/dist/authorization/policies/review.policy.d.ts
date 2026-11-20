import type { Review } from '../../reviews/reviews.service.js';
import type { AuthenticatedUser } from '../../auth/interfaces/authenticated-user.interface.js';
export declare class ReviewPolicy {
    update(user: AuthenticatedUser, review: Review): boolean;
    delete(user: AuthenticatedUser, review: Review): boolean;
}
