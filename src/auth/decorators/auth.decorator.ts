import { applyDecorators, UseGuards } from '@nestjs/common';
import type SecuredUser from '../entities/secured-user.entity.js';
import { JwtAuthGuard } from '../guards/jwt-auth.guard.js';
import { Roles } from './roles.decorator.js';
import { RolesGuard } from '../guards/roles.guard.js';

export function Auth(...roles: Array<SecuredUser['role']>) {
  if (roles.length === 0) {
    return applyDecorators(UseGuards(JwtAuthGuard));
  }
  return applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard));
}
