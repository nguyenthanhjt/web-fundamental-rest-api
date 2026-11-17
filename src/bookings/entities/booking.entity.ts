import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('bookings')
export class Booking 
{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    serviceId: string;
    @Column()
    date: string;
    @Column()
    timeSlot: string;
    @Column()
    customerName: string;
    @Column()
    status: string;
}
