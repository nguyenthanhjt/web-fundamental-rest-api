import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('services')
export class Service {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 160 })
  name!: string;

  @Column({ type: 'int' })
  capacity!: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;
}
