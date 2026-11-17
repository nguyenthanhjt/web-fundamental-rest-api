import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity('reviews')
export class Review 
{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    serviceId: string;
    @Column()
    authorName: string;
    @Column()
    rating: number;
    @Column({nullable: true})
    comment: string;
}
