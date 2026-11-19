import { ForbiddenException } from '@nestjs/common';
import { Role } from '../users/enums/role.enum.js';
import type { AuthenticatedUser } from './interfaces/authenticated-user.interface.js';

export function assertOwnerOrAdmin(ownerId: string, actor: AuthenticatedUser): void {
  if (actor.role !== Role.ADMIN && ownerId !== actor.id) {
    throw new ForbiddenException('Bạn không có quyền truy cập tài nguyên này');
  }
}
