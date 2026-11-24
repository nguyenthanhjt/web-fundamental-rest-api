import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

/** Hashes a seed password synchronously during module initialization. */
export function hashPasswordSync(raw: string): string {
  return bcrypt.hashSync(raw, SALT_ROUNDS);
}

/** Hashes a plain-text password asynchronously for runtime registration/updates. */
export async function hashPassword(raw: string): Promise<string> {
  return bcrypt.hash(raw, SALT_ROUNDS);
}

/** Verifies a plain-text password against a stored bcrypt hash. */
export async function isPasswordMatch(
  raw: string,
  hashed: string,
): Promise<boolean> {
  return bcrypt.compare(raw, hashed);
}
