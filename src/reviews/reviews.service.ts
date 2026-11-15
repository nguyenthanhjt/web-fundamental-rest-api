import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto, PatchReviewDto } from './dto/update-review.dto.js';
import { ReviewsRepository } from './reviews.repository.js';
import { ServicesService } from '../services/services.service.js';
import { Review } from './entities/review.entity.js';

@Injectable()
export class ReviewsService {
  constructor (private readonly reviewsRepository: ReviewsRepository, @Inject(forwardRef(() => ServicesService)) private readonly servicesService: ServicesService) {}

  private nextReviewNumber: number = 1;

  create(serviceId: string, createReviewDto: CreateReviewDto) {
    this.servicesService.findOne(serviceId)
    const review: Review = {
      id: "rvw_" + String(this.nextReviewNumber).padStart(3, "0"),
      serviceId: serviceId,
      authorName: createReviewDto.authorName,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment
    };
    this.nextReviewNumber++;
    return this.reviewsRepository.save(review);
  }

  findAll(serviceId: string) {
    this.servicesService.findOne(serviceId)
    return this.reviewsRepository.findAll(serviceId);
  }

  findOne(id: string) {
    const review = this.reviewsRepository.findById(id);
    if (!review) 
      throw new NotFoundException("Review not found");
    return review;
  }

  update(id: string, updateReviewDto: UpdateReviewDto) {
    const review = this.findOne(id);
    review.authorName = updateReviewDto.authorName;
    review.rating = updateReviewDto.rating;
    review.comment = updateReviewDto.comment !== undefined ? updateReviewDto.comment : review.comment;
    return this.reviewsRepository.save(review);
  }

  patch(id: string, patchReviewDto: PatchReviewDto) {
    const review = this.findOne(id);
    if (!Object.values(patchReviewDto).some((value) => value !== undefined)) 
      throw new BadRequestException("Empty body");
    return this.reviewsRepository.save(Object.assign(review, patchReviewDto));
  }

  remove(id: string) {
    this.findOne(id);
    this.reviewsRepository.delete(id);
  }
}
