export interface RefreshTokenRecord {
  userId: string;
  hash: string;
  expiresAt: Date;
}
