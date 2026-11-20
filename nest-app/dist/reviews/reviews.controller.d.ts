import { ReviewsService } from './reviews.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
import type { AuthenticatedUser } from '../auth/interfaces/authenticated-user.interface.js';
export declare class ReviewsController {
    private readonly reviewsService;
    constructor(reviewsService: ReviewsService);
    findByService(serviceId: string): import("./reviews.service.js").Review[];
    create(serviceId: string, body: CreateReviewDto, user: AuthenticatedUser): import("./reviews.service.js").Review;
    findOne(id: string): import("./reviews.service.js").Review;
    replace(id: string, body: CreateReviewDto, user: AuthenticatedUser): Promise<import("./reviews.service.js").Review>;
    update(id: string, body: UpdateReviewDto, user: AuthenticatedUser): Promise<import("./reviews.service.js").Review>;
    remove(id: string, user: AuthenticatedUser): Promise<void>;
}
