import { BadRequestException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto, PatchReviewDto } from './dto/update-review.dto.js';
import { ServicesService } from '../services/services.service.js';
import { Review } from './entities/review.entity.js';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { parseIdString } from '../utils.js';

@Injectable()
export class ReviewsService {
  constructor (@InjectRepository(Review) private readonly reviewsRepository: Repository<Review>, @Inject(forwardRef(() => ServicesService)) private readonly servicesService: ServicesService) {}

  private convertToReviewResponse(review: Review) {
    return {
      id: 'rvw_' + String(review.id).padStart(3, "0"),
      serviceId: review.serviceId,
      authorName: review.authorName,
      rating: review.rating,
      comment: review.comment
    }
  }

  async create(serviceId: string, createReviewDto: CreateReviewDto) {
    await this.servicesService.findOne(serviceId)
    const review: Review = this.reviewsRepository.create({
      serviceId: serviceId,
      authorName: createReviewDto.authorName,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment
    });
    return this.convertToReviewResponse(await this.reviewsRepository.save(review));
  }

  async findAll(serviceId: string) {
    await this.servicesService.findOne(serviceId)
    return (await this.reviewsRepository.findBy({serviceId})).map((value) => this.convertToReviewResponse(value));
  }

  async findOne(id: string) {
    const review = await this.reviewsRepository.findOneBy({id: parseIdString(id)});
    if (!review) 
      throw new NotFoundException("Review not found");
    return review;
  }

  async findById(id: string) {
    return this.convertToReviewResponse(await this.findOne(id));
  }

  async update(id: string, updateReviewDto: UpdateReviewDto) {
    const review = await this.findOne(id);
    review.authorName = updateReviewDto.authorName;
    review.rating = updateReviewDto.rating;
    review.comment = updateReviewDto.comment !== undefined ? updateReviewDto.comment : review.comment;
    return this.convertToReviewResponse(await this.reviewsRepository.save(review));
  }

  async patch(id: string, patchReviewDto: PatchReviewDto) {
    const review = await this.findOne(id);
    if (!Object.values(patchReviewDto).some((value) => value !== undefined)) 
      throw new BadRequestException("Empty body");
    return this.convertToReviewResponse(await this.reviewsRepository.save(Object.assign(review, patchReviewDto)));
  }

  async remove(id: string) {
    const review = await this.findOne(id);
    await this.reviewsRepository.delete(review.id);
  }
}
