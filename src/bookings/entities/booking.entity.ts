import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { BookingStatus } from '../enums/booking-status.enum';
@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer' })
  userId!: number;

  @Column({ type: 'integer' })
  serviceId!: number;

  @Column({ type: 'varchar', length: 20 })
  date!: string;

  @Column({ type: 'varchar', length: 80 })
  timeSlot!: string;

  @Column({ type: 'varchar', length: 30, default: 'PENDING' })
  status!: BookingStatus;
}
