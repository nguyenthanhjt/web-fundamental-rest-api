import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import type { CurrentUserData } from '../auth/decorators/current-user.decorator';
import { Role } from '../auth/enums/role.enum';
import { ServicesService } from '../services/services.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplaceReviewDto } from './dto/replace-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { Review } from './entities/review.entity';
import { reviewsMock } from '../mock-data/reviews.mock';

const reviewFields = ['rating', 'comment'] as const;

@Injectable()
export class ReviewsService {
  private readonly reviews: Review[] = reviewsMock;
  private nextReviewNumber = this.reviews.length + 1;

  constructor(private readonly services: ServicesService) {}

  findByService(serviceId: string) {
    this.services.findOne(serviceId);
    return this.reviews.filter((review) => review.serviceId === serviceId);
  }

  findOne(id: string) {
    const review = this.reviews.find((item) => item.id === id);
    if (!review) {
      throw new NotFoundException({ message: 'Review not found' });
    }
    return review;
  }

  private assertCanAccess(review: Review, user: CurrentUserData): void {
    if (user.role !== Role.Admin && review.userId !== user.sub) {
      throw new ForbiddenException('You do not have access to this review');
    }
  }

  create(userId: string, serviceId: string, dto: CreateReviewDto) {
    this.services.findOne(serviceId);
    const review: Review = {
      id: 'rev_' + String(this.nextReviewNumber).padStart(3, '0'),
      userId,
      serviceId,
      rating: dto.rating,
      comment: dto.comment ?? '',
    };
    this.nextReviewNumber += 1;
    this.reviews.push(review);
    return review;
  }

  replace(id: string, dto: ReplaceReviewDto, user: CurrentUserData) {
    const review = this.findOne(id);
    this.assertCanAccess(review, user);
    review.rating = dto.rating;
    review.comment = dto.comment;
    return review;
  }

  update(id: string, dto: UpdateReviewDto, user: CurrentUserData) {
    const review = this.findOne(id);
    this.assertCanAccess(review, user);
    if (!reviewFields.some((field) => dto[field] !== undefined)) {
      throw new BadRequestException({
        message: 'At least one of rating, comment is required',
      });
    }
    if (dto.rating !== undefined) review.rating = dto.rating;
    if (dto.comment !== undefined) review.comment = dto.comment;
    return review;
  }

  remove(id: string, user: CurrentUserData): void {
    const review = this.findOne(id);
    this.assertCanAccess(review, user);
    const index = this.reviews.indexOf(review);
    this.reviews.splice(index, 1);
  }
}
