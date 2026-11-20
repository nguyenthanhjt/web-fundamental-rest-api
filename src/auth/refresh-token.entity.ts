import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('auth_refresh_tokens')
export class RefreshTokenEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  familyId!: string;

  @Column()
  userId!: string;

  @Column({ type: 'timestamptz' })
  createdAt!: Date;

  @Column({ type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ type: 'timestamptz' })
  familyExpiresAt!: Date;

  @Column({ type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  claims!: Record<string, unknown> | null;
}

@Entity('auth_refresh_token_families')
export class RefreshTokenFamilyEntity {
  @PrimaryColumn()
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: 'timestamptz', nullable: true })
  revokedAt!: Date | null;
}
