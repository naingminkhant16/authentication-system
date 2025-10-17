import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import {AuthService} from "./auth.service";
import {LoginDto} from "./dto/login.dto";
import {RegisterDto} from "./dto/register.dto";
import {Employee} from "@prisma/client";
import {ApiResponse} from "../../common/utils/api.response";
import {Request, Response} from "express";
import {AuthGuard} from "@nestjs/passport";

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Req() req: Request) {
        return req['user'];
    }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({passthrough: true}) res: Response
    ): Promise<ApiResponse<{ access_token: string }>> {
        const {accessToken, refreshToken, auth} = await this.authService.login(loginDto);

        this.authService.setRefreshTokenCookie(refreshToken, res);

        return ApiResponse.success({access_token: accessToken, auth});
    }

    @Post('/register')
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() registerDto: RegisterDto): Promise<ApiResponse<{
        id: number,
        name: string,
        employeeId: string,
        createdAt: Date
    }>> {
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

    @Post('/refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(
        @Req() req: Request,
        @Res({passthrough: true}) res: Response,
    ): Promise<ApiResponse<{ access_token: string }>> {
        const refresh_token = req.cookies['refresh_token'];

        if (!refresh_token) {
            throw new BadRequestException('Refresh token not found');
        }

        const {accessToken, newRefreshToken} =
            await this.authService.refreshToken(refresh_token);

        this.authService.setRefreshTokenCookie(newRefreshToken, res);

        return ApiResponse.success(
            {access_token: accessToken},
            'Refresh Token Success',
        );
    }

    @UseGuards(AuthGuard('jwt'))
    @Post('/logout')
    @HttpCode(HttpStatus.OK)
    async logout(
        @Req() req: Request,
        @Res({passthrough: true}) res: Response,
    ): Promise<ApiResponse<null>> {
        const refresh_token = req.cookies['refresh_token'];

        if (!refresh_token) throw new BadRequestException('Refresh token not found');

        await this.authService.logout(refresh_token, res);

        return ApiResponse.success(null, 'Logout Successful');
    }
}