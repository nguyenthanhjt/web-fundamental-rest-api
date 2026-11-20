import * as bcrypt from 'bcrypt';
import { Role } from '../auth/enums/role.enum';
import { User } from '../users/entities/user.entity';

export async function createUsersMock(): Promise<User[]> {
  return [
    {
      id: 'usr_001',
      name: 'admmin',
      email: 'admin@example.com',
      passwordHash: await bcrypt.hash('Admin@123', 10),
      role: Role.Admin,
      createdAt: new Date(),
    },
    {
      id: 'usr_002',
      name: 'user',
      email: 'user@example.com',
      passwordHash: await bcrypt.hash('User@1234', 10),
      role: Role.User,
      createdAt: new Date(),
    },
  ];
}
