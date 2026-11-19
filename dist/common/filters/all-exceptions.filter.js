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
var AllExceptionsFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
let AllExceptionsFilter = AllExceptionsFilter_1 = class AllExceptionsFilter {
    httpAdapterHost;
    logger = new common_1.Logger(AllExceptionsFilter_1.name);
    constructor(httpAdapterHost) {
        this.httpAdapterHost = httpAdapterHost;
    }
    catch(exception, host) {
        const { httpAdapter } = this.httpAdapterHost;
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const response = ctx.getResponse();
        // 1. Xác định HTTP status
        const statusCode = exception instanceof common_1.HttpException
            ? exception.getStatus()
            : common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors = [];
        // 2. Đọc nội dung lỗi NestJS
        if (exception instanceof common_1.HttpException) {
            const errorResponse = exception.getResponse();
            if (typeof errorResponse === 'string') {
                message = errorResponse;
            }
            else if (errorResponse !== null &&
                typeof errorResponse === 'object' &&
                'message' in errorResponse) {
                const rawMessage = errorResponse.message;
                if (Array.isArray(rawMessage)) {
                    message = 'Validation failed';
                    errors = rawMessage.map(String);
                }
                else if (typeof rawMessage === 'string') {
                    message = rawMessage;
                }
            }
        }
        else {
            // Không để lộ chi tiết lỗi hệ thống cho client
            this.logger.error('Unexpected exception', exception instanceof Error
                ? exception.stack
                : String(exception));
        }
        // 3. Định dạng response lỗi chung
        const responseBody = {
            success: false,
            statusCode,
            message,
            errors,
            path: httpAdapter.getRequestUrl(request),
            timestamp: new Date().toISOString(),
        };
        // 4. Gửi response
        httpAdapter.reply(response, responseBody, statusCode);
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = AllExceptionsFilter_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [core_1.HttpAdapterHost])
], AllExceptionsFilter);
