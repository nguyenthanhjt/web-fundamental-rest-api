import { IsString, Matches } from 'class-validator';

export class LoginDto {
  @IsString()
  @Matches(/\S/, { message: 'Username must not be empty' })
  username: string;

  @IsString()
  @Matches(/\S/, { message: 'Password must not be empty' })
  password: string;
}