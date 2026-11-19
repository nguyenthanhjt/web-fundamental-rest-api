import { BadRequestException, ForbiddenException, forwardRef, Inject, Injectable, NotFoundException } from '@nestjs/common';
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

  convertToReviewResponse(review: Review) {
    return {
      id: 'rvw_' + String(review.id).padStart(3, "0"),
      serviceId: review.serviceId,
      authorId: review.authorId,
      rating: review.rating,
      comment: review.comment
    }
  }

  async create(serviceId: string, createReviewDto: CreateReviewDto, authorId: number) {
    await this.servicesService.findOne(serviceId)
    const review: Review = this.reviewsRepository.create({
      serviceId: serviceId,
      authorId: authorId,
      rating: createReviewDto.rating,
      comment: createReviewDto.comment
    });
    return await this.reviewsRepository.save(review);
  }

  async findAll(serviceId: string) {
    await this.servicesService.findOne(serviceId)
    return (await this.reviewsRepository.find({where: {serviceId}, relations: {author: true}}));
  }

  async findOne(id: string) {
    const review = await this.reviewsRepository.findOne({where: {id: parseIdString(id)}, relations: {author: true}});
    if (!review) 
      throw new NotFoundException("Review not found");
    return review;
  }

  async update(id: string, updateReviewDto: UpdateReviewDto, authorId: number) {
    const review = await this.findOne(id);
    if (authorId !== review.authorId)
      throw new ForbiddenException();
    review.rating = updateReviewDto.rating;
    review.comment = updateReviewDto.comment !== undefined ? updateReviewDto.comment : review.comment;
    return (await this.reviewsRepository.save(review));
  }

  async patch(id: string, patchReviewDto: PatchReviewDto, authorId: number) {
    const review = await this.findOne(id);
    if (authorId !== review.authorId)
      throw new ForbiddenException();
    if (!Object.values(patchReviewDto).some((value) => value !== undefined)) 
      throw new BadRequestException("Empty body");
    return await this.reviewsRepository.save(Object.assign(review, patchReviewDto));
  }

  async remove(id: string, authorId: number) {
    const review = await this.findOne(id);
    if (authorId !== review.authorId)
      throw new ForbiddenException();
    await this.reviewsRepository.delete(review.id);
  }
}
