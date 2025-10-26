import {IsNotEmpty, IsString, MinLength} from "class-validator";

export class OtpRequestDto {
    @IsNotEmpty()
    @MinLength(1)
    @IsString()
    email: string;

    @IsNotEmpty()
    @MinLength(1)
    @IsString()
    password: string;
}