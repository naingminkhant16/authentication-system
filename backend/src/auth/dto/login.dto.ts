import {IsNotEmpty} from "class-validator";

export class LoginDto {
    @IsNotEmpty()
    employeeId: string;
    
    @IsNotEmpty()
    password: string;
}