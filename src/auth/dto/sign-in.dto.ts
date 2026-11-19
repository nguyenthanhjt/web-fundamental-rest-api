import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SignInDto {
    @IsEmail()
    email: string;
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(20)
    password: string;
}