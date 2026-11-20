import { Role } from '../../auth/enums/role.enum';

export class User {
  id!: string;
  name!: string;
  email!: string;
  passwordHash!: string;
  role: Role = Role.User;
  createdAt!: Date;
}
