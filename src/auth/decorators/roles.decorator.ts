import { SetMetadata } from '@nestjs/common';
import { Role } from '../../users/enums/role.enum.js';

export const REQUIRED_ROLES = 'auth:roles';
export const Roles = (...roles: Role[]) => SetMetadata(REQUIRED_ROLES, roles);
