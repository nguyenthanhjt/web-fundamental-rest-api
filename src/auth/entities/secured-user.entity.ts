export default interface SecuredUser {
  username: string;
  id: string;
  role: 'USER' | 'ADMIN';
}
