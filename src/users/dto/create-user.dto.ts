import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateUserDto {
    @IsNotEmpty()
    @IsString()
    name!:string;

    @IsEmail()
    @IsNotEmpty({ message: "email not invalid" })
    email!: string;
    @IsString()
    @IsNotEmpty()
    @MinLength(8, { message: 'Mật khẩu tối thiểu 8 ký tự' })
    @MaxLength(72, { message: 'Mật khẩu tối đa 72 ký tự' })
    password!: string;
}
