import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entity/users.entity.js";

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
    customerId: number;
    @Column()
    status: string;
    @ManyToOne(() => User)
    @JoinColumn({name: 'customerId'})
    customer: User;
}
