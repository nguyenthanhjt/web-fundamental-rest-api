import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_ROLES } from '../decorators/roles.decorator.js';
import { Role } from '../../users/enums/role.enum.js';
import type { AuthenticatedUser } from '../interfaces/authenticated-user.interface.js';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<Role[]>(REQUIRED_ROLES, [
      context.getHandler(), context.getClass(),
    ]);
    if (!roles?.length) return true;
    const { user } = context.switchToHttp().getRequest<{ user?: AuthenticatedUser }>();
    return !!user && roles.includes(user.role);
  }
}
