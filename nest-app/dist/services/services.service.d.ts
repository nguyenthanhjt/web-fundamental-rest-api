export type Service = {
    id: string;
    name: string;
    capacity: number;
    price: number;
};
export declare class ServicesService {
    private readonly services;
    findAll(): Service[];
    findOne(id: string): Service;
    exists(id: string): boolean;
}
