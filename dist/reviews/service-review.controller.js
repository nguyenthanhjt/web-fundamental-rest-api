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
exports.ServiceReviewController = void 0;
const common_1 = require("@nestjs/common");
const reviews_service_js_1 = require("./reviews.service.js");
const create_review_dto_js_1 = require("./dto/create-review.dto.js");
let ServiceReviewController = class ServiceReviewController {
    reviewService;
    constructor(reviewService) {
        this.reviewService = reviewService;
    }
    // GET /api/v1/services/:serviceId/reviews
    findByServiceId(serviceId) {
        return this.reviewService.findByServiceId(serviceId);
    }
    // POST /api/v1/services/:serviceId/reviews
    create(serviceId, body) {
        return this.reviewService.create(serviceId, body);
    }
};
exports.ServiceReviewController = ServiceReviewController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('serviceId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Array)
], ServiceReviewController.prototype, "findByServiceId", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('serviceId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, create_review_dto_js_1.CreateReviewDto]),
    __metadata("design:returntype", Object)
], ServiceReviewController.prototype, "create", null);
exports.ServiceReviewController = ServiceReviewController = __decorate([
    (0, common_1.Controller)('api/v1/services/:serviceId/reviews'),
    __metadata("design:paramtypes", [reviews_service_js_1.ReviewsService])
], ServiceReviewController);
