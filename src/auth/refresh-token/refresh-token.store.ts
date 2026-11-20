export const REFRESH_TOKEN_STORE = Symbol('REFRESH_TOKEN_STORE');

export interface RefreshTokenStore {
  save(userId: string, token: string, expiresAt: Date): Promise<void>;
  consume(userId: string, token: string): Promise<boolean>;
  revokeAllByUser(userId: string): Promise<void>;
}
