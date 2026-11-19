"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const services_service_js_1 = require("../services/services.service.js");
let ReviewsService = class ReviewsService {
    serviceService;
    constructor(serviceService) {
        this.serviceService = serviceService;
    }
    reviews = [];
    nextId = 1;
    findByServiceId(serviceId) {
        this.serviceService.findById(serviceId);
        return this.reviews.filter(item => item.serviceId === serviceId);
    }
    findAll() {
        return this.reviews;
    }
    findById(id) {
        const review = this.reviews.find(item => item.id === id);
        if (!review) {
            throw new common_1.NotFoundException('Review not found');
        }
        return review;
    }
    create(serviceId, dto) {
        this.serviceService.findById(serviceId);
        const review = {
            id: 'rev_' + String(this.nextId++).padStart(3, '0'),
            serviceId,
            authorName: dto.authorName,
            rating: dto.rating,
            comment: dto.comment ?? '',
        };
        this.reviews.push(review);
        return review;
    }
    replace(id, dto) {
        const review = this.findById(id);
        review.authorName = dto.authorName;
        review.rating = dto.rating;
        review.comment = dto.comment;
        return review;
    }
    update(id, dto) {
        const review = this.findById(id);
        const fields = [
            'authorName',
            'rating',
            'comment',
        ];
        const presentFields = fields.filter(field => Object.hasOwn(dto ?? {}, field));
        if (presentFields.length === 0) {
            throw new common_1.BadRequestException('At least one field is required');
        }
        if (Object.hasOwn(dto, 'authorName')) {
            review.authorName = dto.authorName;
        }
        if (Object.hasOwn(dto, 'rating')) {
            review.rating = dto.rating;
        }
        if (Object.hasOwn(dto, 'comment')) {
            review.comment = dto.comment;
        }
        return review;
    }
    delete(id) {
        const index = this.reviews.findIndex(item => item.id === id);
        if (index === -1) {
            throw new common_1.NotFoundException('Review not found');
        }
        this.reviews.splice(index, 1);
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [services_service_js_1.ServicesService])
], ReviewsService);
