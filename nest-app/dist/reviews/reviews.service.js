var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
import { Injectable, NotFoundException, } from '@nestjs/common';
import { ServicesService } from '../services/services.service.js';
let ReviewsService = class ReviewsService {
    servicesService;
    reviews = [];
    nextReviewNumber = 1;
    constructor(servicesService) {
        this.servicesService = servicesService;
    }
    findOne(id) {
        const review = this.reviews.find((item) => item.id === id);
        if (!review) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }
        return review;
    }
    findByServiceId(serviceId) {
        if (!this.servicesService.exists(serviceId)) {
            throw new NotFoundException(`Service with ID ${serviceId} not found`);
        }
        return this.reviews.filter((review) => review.serviceId === serviceId);
    }
    create(serviceId, data) {
        if (!this.servicesService.exists(serviceId)) {
            throw new NotFoundException(`Service with ID ${serviceId} not found`);
        }
        const review = {
            id: `rev_${this.nextReviewNumber.toString().padStart(3, '0')}`,
            serviceId,
            authorName: data.authorName,
            rating: data.rating,
            comment: data.comment,
        };
        this.nextReviewNumber += 1;
        this.reviews.push(review);
        return review;
    }
    replace(id, data) {
        const review = this.findOne(id);
        review.authorName = data.authorName;
        review.rating = data.rating;
        review.comment = data.comment;
        return review;
    }
    update(id, data) {
        const review = this.findOne(id);
        Object.assign(review, data);
        return review;
    }
    remove(id) {
        const index = this.reviews.findIndex((item) => item.id === id);
        if (index === -1) {
            throw new NotFoundException(`Review with ID ${id} not found`);
        }
        this.reviews.splice(index, 1);
    }
};
ReviewsService = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [ServicesService])
], ReviewsService);
export { ReviewsService };
//# sourceMappingURL=reviews.service.js.map