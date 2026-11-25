import { Policy, type PolicyBefore } from '@nestjs/authorization';
import { Role } from '../auth/enum/roles.enum';
import type { User } from '../users/entities/user.entity';
import type { Review } from './entities/review.entity';
import { ReviewsService } from './reviews.service';

@Policy()
export class ReviewPolicy implements PolicyBefore<User> {
  constructor(private readonly reviewsService: ReviewsService) {}

  before(user: User | null) {
    if (user?.role === Role.ADMIN) return true;
  }

  create(user: User | null) {
    return !!user;
  }

  async update(user: User | null, reviewId: number) {
    if (!user) return false;
    const review = await this.reviewsService.findOne(reviewId);
    return review.userId === user.id;
  }

  async remove(user: User | null, reviewId: number) {
    if (!user) return false;
    const review = await this.reviewsService.findOne(reviewId);
    return review.userId === user.id;
  }
}
