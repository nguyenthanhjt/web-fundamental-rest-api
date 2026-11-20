import { ServicesService } from '../services/services.service.js';
import { CreateReviewDto } from './dto/create-review.dto.js';
import { UpdateReviewDto } from './dto/update-review.dto.js';
export type Review = {
    id: string;
    serviceId: string;
    authorName: string;
    rating: number;
    comment: string;
};
export declare class ReviewsService {
    private readonly servicesService;
    private readonly reviews;
    private nextReviewNumber;
    constructor(servicesService: ServicesService);
    findOne(id: string): Review;
    findByServiceId(serviceId: string): Review[];
    create(serviceId: string, data: CreateReviewDto): Review;
    replace(id: string, data: CreateReviewDto): Review;
    update(id: string, data: UpdateReviewDto): Review;
    remove(id: string): void;
}
