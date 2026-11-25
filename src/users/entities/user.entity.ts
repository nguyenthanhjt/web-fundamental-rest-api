import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../auth/enum/roles.enum';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email!: string;

  @Column({ type: 'varchar', length: 255, select: false, nullable: true })
  passwordHash?: string | null;

  @Column({ type: 'enum', enum: Role, default: Role.USER })
  role!: Role;

  @CreateDateColumn()
  createdAt!: Date;
}
