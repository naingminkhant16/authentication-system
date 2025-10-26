import {IsNotEmpty, IsString, MinLength} from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    @MinLength(1)
    @IsString()
    email: string;

    @IsNotEmpty()
    @MinLength(1)
    @IsString()
    password: string;

    @IsString()
    recaptchaToken?: string;
}