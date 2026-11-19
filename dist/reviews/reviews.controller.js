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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_js_1 = require("./reviews.service.js");
const create_review_dto_js_1 = require("./dto/create-review.dto.js");
const replace_review_dto_js_1 = require("./dto/replace-review.dto.js");
const update_review_dto_js_1 = require("./dto/update-review.dto.js");
let ReviewsController = class ReviewsController {
    reviewService;
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    findByServiceId(serviceId) {
        return this.reviewService.findByServiceId(serviceId);
    }
    create(serviceId, body) {
        return this.reviewService.create(serviceId, body);
    }
    findAll() {
        return this.reviewService.findAll();
    }
    findOne(id) {
        return this.reviewService.findById(id);
    }
    replace(id, body) {
        return this.reviewService.replace(id, body);
    }
    update(id, body) {
        return this.reviewService.update(id, body);
    }
    delete(id) {
        this.reviewService.delete(id);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, common_1.Get)('services/:serviceId/reviews'),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], ReviewsController.prototype, "findByServiceId", null);
__decorate([
    (0, common_1.Post)('services/:serviceId/reviews'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_review_dto_js_1.CreateReviewDto]),
    __metadata("design:returntype", Object)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('reviews'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Array)
], ReviewsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('reviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Object)
], ReviewsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)('reviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, replace_review_dto_js_1.ReplaceReviewDto]),
    __metadata("design:returntype", Object)
], ReviewsController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)('reviews/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_review_dto_js_1.UpdateReviewDto]),
    __metadata("design:returntype", Object)
], ReviewsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)('reviews/:id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ReviewsController.prototype, "delete", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, common_1.Controller)('api/v1'),
    __metadata("design:paramtypes", [reviews_service_js_1.ReviewsService])
], ReviewsController);
