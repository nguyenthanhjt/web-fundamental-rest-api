import { ServicesService } from './services.service.js';
export declare class ServicesController {
    private readonly servicesService;
    constructor(servicesService: ServicesService);
    findAll(): import("./services.service.js").Service[];
    findOne(id: string): import("./services.service.js").Service;
}
