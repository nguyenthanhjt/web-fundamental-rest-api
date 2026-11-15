import { BadRequestException, Injectable } from '@nestjs/common';
import type { CreateReviewDto, Review, UpdateReviewDto } from './dto/review.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ReviewsService {
  private reviews: Review[] = [];

  private services = [
    { id: 'svc_001', name: 'Spa 60 phút', capacity: 4, price: 350000 },
    { id: 'svc_002', name: 'Gym theo buổi', capacity: 20, price: 80000 },
  ];

  private reviewIdCounter = 1;

  createReview(serviceId: string, body: CreateReviewDto): Review {
    const service = this.services.find((item) => item.id === serviceId);
    if (!service) {
      throw new NotFoundException('Dịch vụ không tồn tại');
    }

    const { authorName, rating, comment } = body;
    const review = {
      id: `rev_${this.reviewIdCounter}`,
      serviceId,
      authorName,
      rating,
      comment: comment ?? '',
    };
    this.reviews.push(review);
    this.reviewIdCounter++;
    return review;
  }

  getAllReviews(id: string): Review[] {
    const service = this.services.find((service) => service.id === id);
    if (!service) {
      throw new NotFoundException('Dịch vụ không tồn tại');
    }
    return this.reviews.filter((review) => review.serviceId === id);
  }

  replaceReview(id: string, body: CreateReviewDto): Review {
    const review = this.getReview(id);

    const { authorName, rating, comment } = body;
    // CreateReviewDto cho phép thiếu comment khi POST, nhưng PUT cần đủ trường.
    if (comment === undefined) {
      throw new BadRequestException('PUT bắt buộc có nhận xét (comment)');
    }

    review.authorName = authorName;
    review.rating = rating;
    review.comment = comment;
    return review;
  }

  getReview(id: string): Review {
    const review = this.reviews.find((review) => review.id === id);
    if (!review) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }
    return review;
  }

  updateReview(id: string, body: UpdateReviewDto): Review {
    const review = this.getReview(id);

    const { authorName, rating, comment } = body;

    if (authorName !== undefined) {
      review.authorName = authorName;
    }

    if (rating !== undefined) {
      review.rating = rating;
    }

    if (comment !== undefined) {
      review.comment = comment;
    }

    return review;
  }


  deleteReview(id: string): string {
    const index = this.reviews.findIndex((review) => review.id === id);
    if (index === -1) {
      throw new NotFoundException('Đánh giá không tồn tại');
    }
    this.reviews.splice(index, 1);
    return 'Xóa đánh giá thành công';
  }

}
