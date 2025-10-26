import {IsEmail, IsNotEmpty, IsString, Length} from 'class-validator';

export class OtpVerifyDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    code: string;
}
