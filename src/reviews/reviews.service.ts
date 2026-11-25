import { Injectable, NotFoundException } from '@nestjs/common';
import { ServicesService } from '../services/services.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { ReplaceReviewDto } from './dto/replace-review.dto';
import { Review } from './review.model';
import { UpdateReviewDto } from './dto/update-review.dto';

@Injectable()
export class ReviewService {
  private readonly reviews: Review[] = [];
  private nextReviewNumber = 1;

  constructor(private readonly servicesService: ServicesService) {}

  findForService(serviceId: string): Review[] {
    this.servicesService.findOne(serviceId);
    return this.reviews.filter((review) => review.serviceId === serviceId);
  }

  findOne(id: string): Review {
    const review = this.reviews.find((item) => item.id === id);
    if (!review) {
      throw new NotFoundException('Review not found');
    }
    return review;
  }

  create(serviceId: string, body: CreateReviewDto): Review {
    this.servicesService.findOne(serviceId);

    const review: Review = {
      id: `rvw_${String(this.nextReviewNumber).padStart(3, '0')}`,
      serviceId,
      authorName: body.authorName,
      rating: body.rating,
      comment: body.comment ?? '',
    };
    this.nextReviewNumber += 1;
    this.reviews.push(review);
    return review;
  }

  replace(id: string, body: ReplaceReviewDto): Review {
    const review = this.findOne(id);
    review.authorName = body.authorName;
    review.rating = body.rating;
    review.comment = body.comment;
    return review;
  }

  update(id: string, body: UpdateReviewDto): Review {
    const review = this.findOne(id);
    if (body.authorName !== undefined) {
      review.authorName = body.authorName;
    }
    if (body.rating !== undefined) {
      review.rating = body.rating;
    }
    if (body.comment !== undefined) {
      review.comment = body.comment;
    }
    return review;
  }

  remove(id: string): void {
    const review = this.findOne(id);
    this.reviews.splice(this.reviews.indexOf(review), 1);
  }
}
