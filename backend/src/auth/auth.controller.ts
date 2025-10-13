import {Body, Controller, HttpCode, HttpStatus, Post, Res} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";
import {Employee} from "@prisma/client";
import {ApiResponse} from "../../common/utils/api.response";

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @Post('/login')
    login(@Body() loginDto: LoginDto, @Res({passthrough: true}) res: Response) {
        return {
            employeeId: loginDto.employeeId,
            password: loginDto.password,
        }
    }

    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto, @Res({passthrough: true}) res: Response) {
        const employee: Employee = await this.authService.register(registerDto);

        return ApiResponse.success(
            {
                id: employee.id,
                name: employee.name,
                employeeId: employee.employeeId,
                createdAt: employee.createdAt
            },
            "New Employee Created Successfully. Use Employee ID to Login.",
            HttpStatus.CREATED
        );
    }
}