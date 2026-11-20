import { ServicesService } from '../services/services.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import { AuthorizationService } from '@nestjs/authorization';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export type Review = {
    id: string;
    serviceId: string;
    authorId: number;
    authorName: string;
    rating: number;
    comment: string;
};
export declare class ReviewsService {
    private readonly servicesService;
    private readonly authorization;
    private readonly reviews;
    private nextReviewNumber;
    constructor(servicesService: ServicesService, authorization: AuthorizationService);
    findOne(id: string): Review;
    findByServiceId(serviceId: string): Review[];
    create(serviceId: string, data: CreateReviewDto, authorId: number): Review;
    replace(id: string, data: CreateReviewDto, user: AuthenticatedUser): Promise<Review>;
    update(id: string, data: UpdateReviewDto, user: AuthenticatedUser): Promise<Review>;
    remove(id: string, user: AuthenticatedUser): Promise<void>;
}
