import { Injectable } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RefreshTokenRecord } from './refresh-token.record';
import { RefreshTokenStore } from './refresh-token.store';

@Injectable()
export class InMemoryRefreshTokenStore implements RefreshTokenStore {
  private readonly records: RefreshTokenRecord[] = [];

  async save(userId: string, token: string, expiresAt: Date): Promise<void> {
    this.records.push({
      userId,
      hash: this.hash(token),
      expiresAt,
    });
  }

  async consume(userId: string, token: string): Promise<boolean> {
    const tokenHash = this.hash(token);
    const index = this.records.findIndex(
      (record) =>
        record.userId === userId &&
        record.hash === tokenHash &&
        record.expiresAt.getTime() > Date.now(),
    );

    if (index === -1) {
      return false;
    }

    this.records.splice(index, 1);
    return true;
  }

  async revokeAllByUser(userId: string): Promise<void> {
    for (let index = this.records.length - 1; index >= 0; index -= 1) {
      if (this.records[index].userId === userId) {
        this.records.splice(index, 1);
      }
    }
  }

  private hash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
