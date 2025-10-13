import {IsNotEmpty, MaxLength, MinLength} from "class-validator";

export class RegisterDto {
    @IsNotEmpty()
    @MaxLength(30)
    name: string;

    @IsNotEmpty()
    @MinLength(8)
    @MaxLength(50)
    password: string;

    @IsNotEmpty()
    confirmPassword: string;

    @IsNotEmpty()
    departmentId: number;
}