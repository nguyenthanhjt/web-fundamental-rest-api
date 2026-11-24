export interface User {
  id: string;
  username: string;
  password: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
