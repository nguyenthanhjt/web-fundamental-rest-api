import { Injectable } from '@nestjs/common';
import { Service } from './entities/service.entity.js';

@Injectable()
export class ServicesRepository {
    private services: Service[] = [
        { id: "svc_001", name: "Spa 60 phút", capacity: 4, price: 350000 },
        { id: "svc_002", name: "Gym theo buổi", capacity: 20, price: 80000 },
    ];

    findAll(): Service[] {
        return [...this.services];
    }

    findById(id: string): Service | undefined {
        const service = this.services.find((service) => service.id === id);
        if (!service)
            return undefined;
        return {...service};
    }
}
