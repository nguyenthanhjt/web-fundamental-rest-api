import { Injectable } from '@nestjs/common';
import { AuthenticationStorage, type RefreshTokenRecord, type RefreshTokenStore } from '@nestjs/authentication';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshTokenEntity, RefreshTokenFamilyEntity } from './refresh-token.entity';

@Injectable()
export class TypeOrmRefreshTokenStore implements RefreshTokenStore {
  constructor(
    @InjectRepository(RefreshTokenEntity) private readonly tokens: Repository<RefreshTokenEntity>,
    @InjectRepository(RefreshTokenFamilyEntity) private readonly families: Repository<RefreshTokenFamilyEntity>,
    storage: AuthenticationStorage,
  ) {
    storage.registerSource({ refreshTokens: this });
  }

  async getRefreshToken(id: string): Promise<RefreshTokenRecord | undefined> {
    const token = await this.tokens.findOneBy({ id });
    return token ? { ...token, usedAt: token.usedAt ?? undefined, claims: token.claims ?? undefined } : undefined;
  }

  async saveRefreshToken(record: RefreshTokenRecord): Promise<void> {
    await this.families.upsert({ id: record.familyId, userId: record.userId, revokedAt: null }, ['id']);
    const entity: RefreshTokenEntity = {
      ...record,
      usedAt: record.usedAt ?? null,
      claims: record.claims ?? null,
    };
    // TypeORM's deep-partial typing does not model a JSONB Record value correctly.
    await this.tokens.insert(entity as never);
  }

  async markRefreshTokenUsed(id: string, at: Date): Promise<boolean> {
    const result = await this.tokens
      .createQueryBuilder()
      .update()
      .set({ usedAt: at })
      .where('id = :id AND "usedAt" IS NULL', { id })
      .execute();
    return result.affected === 1;
  }

  async revokeRefreshTokenFamily(familyId: string): Promise<void> {
    await this.families.update(familyId, { revokedAt: new Date() });
  }

  async isRefreshTokenFamilyRevoked(familyId: string): Promise<boolean> {
    const family = await this.families.findOneBy({ id: familyId });
    return !!family?.revokedAt;
  }

  async revokeUserRefreshTokens(userId: string): Promise<void> {
    await this.families.update({ userId }, { revokedAt: new Date() });
  }
}
