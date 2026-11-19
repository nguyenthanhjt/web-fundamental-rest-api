import type { User } from '../../users/interfaces/user.interface.js';

export type AuthenticatedUser = Pick<User, 'id' | 'email' | 'role'>;
