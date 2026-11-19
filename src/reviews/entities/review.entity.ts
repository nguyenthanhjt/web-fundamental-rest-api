import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { User } from "../../users/entity/users.entity.js";

@Entity('reviews')
export class Review 
{
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    serviceId: string;
    @Column()
    rating: number;
    @Column({nullable: true})
    comment: string;
    @Column()
    authorId: number;
    @ManyToOne(() => User)
    @JoinColumn({name: 'authorId'})
    author: User;
}
