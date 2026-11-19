"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const bookings_module_js_1 = require("./bookings/bookings.module.js");
const services_module_js_1 = require("./services/services.module.js");
const reviews_module_js_1 = require("./reviews/reviews.module.js");
const all_exceptions_filter_js_1 = require("./common/filters/all-exceptions.filter.js");
const response_interceptor_js_1 = require("./common/interceptors/response.interceptor.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            services_module_js_1.ServicesModule,
            bookings_module_js_1.BookingsModule,
            reviews_module_js_1.ReviewsModule,
        ],
        providers: [
            {
                provide: core_1.APP_FILTER,
                useClass: all_exceptions_filter_js_1.AllExceptionsFilter,
            },
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: response_interceptor_js_1.ResponseInterceptor,
            },
        ],
    })
], AppModule);
