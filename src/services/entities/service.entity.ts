import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity('services')
export class Service 
{
    @PrimaryColumn()
    id: string;
    @Column()
    name: string;
    @Column()
    capacity: number;
    @Column()
    price: number;
}
