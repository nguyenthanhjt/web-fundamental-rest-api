import { SetMetadata } from '@nestjs/common';
import type SecuredUser from '../entities/secured-user.entity.js';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Array<SecuredUser['role']>) =>
  SetMetadata(ROLES_KEY, roles);
