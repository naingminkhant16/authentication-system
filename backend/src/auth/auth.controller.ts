import {
    BadRequestException,
    Body,
    Controller,
    Get,
    HttpCode,
    HttpStatus,
    Post,
    Query,
    Req,
    Res,
    UseGuards
} from "@nestjs/common";
import {AuthService} from "./services/auth.service";
import {LoginDto} from "./dtos/login.dto";
import {RegisterDto} from "./dtos/register.dto";
import {Employee} from "@prisma/client";
import {ApiResponse} from "../common/utils/api.response";
import {Request, Response} from "express";
import {AuthGuard} from "@nestjs/passport";
import {GoogleOauthGuard} from "./guards/google-oauth.guard";
import axios from 'axios';
import {OtpRequestDto} from "./dtos/otp-request.dto";
import {OtpVerifyDto} from "./dtos/otp-verify.dt0";

@Controller('api/auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {
    }

    @UseGuards(AuthGuard('jwt'))
    @Get('me')
    getProfile(@Req() req: Request) {
        return req.user;
    }

    @Post('/login')
    @HttpCode(HttpStatus.OK)
    async login(
        @Body() loginDto: LoginDto,
        @Res({passthrough: true}) res: Response
    ): Promise<ApiResponse<{ access_token: string }>> {
        // Verify reCAPTCHA
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${loginDto.recaptchaToken}`
        );
        const {success} = response.data;
        if (!success) throw new BadRequestException('reCAPTCHA verification failed');

        // Attempt login
        const {accessToken, refreshToken, auth} = await this.authService.login(loginDto);
        // Set refresh token in http-only cookies
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
        // Verify reCAPTCHA
        const response = await axios.post(
            `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.GOOGLE_RECAPTCHA_SECRET_KEY}&response=${registerDto.recaptchaToken}`
        );
        const {success} = response.data;
        if (!success) throw new BadRequestException('reCAPTCHA verification failed');

        // Register
        const employee: Employee = await this.authService.register(registerDto);

        return ApiResponse.success(
            {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                employeeId: employee.employeeId,
                createdAt: employee.createdAt
            },
            "New Employee Created Successfully.",
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

        if (!refresh_token) throw new BadRequestException('Refresh token not found');

        const {accessToken, newRefreshToken} = await this.authService.refreshToken(refresh_token);

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


    @Get('/verify-email')
    @HttpCode(HttpStatus.OK)
    async verifyMail(@Query('token') token: string): Promise<ApiResponse<null>> {
        await this.authService.verifyMail(token);
        return ApiResponse.success(null, 'Email verified successfully');
    }

    // Google OAuth Endpoints
    @Get('google')
    @UseGuards(GoogleOauthGuard)
    async googleLogin(@Req() req: Request, @Query('departmentId') departmentId: string) {
    }

    @Get('google/callback')
    @UseGuards(GoogleOauthGuard)
    async googleOAuthCallback(
        @Req() req: Request,
        @Res() res: Response
    ): Promise<void> {
        const {user} = req;

        if (user) {
            const {refreshToken} = await this.authService.OAuthSignIn(
                user['name'],
                user['email'],
                Number(user['departmentId'])
            );

            res.cookie('refresh_token', refreshToken, {
                httpOnly: true,
                secure: process.env.APP_ENV === 'production',
                sameSite: 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            });
        }
        return res.redirect(process.env.FRONTEND_URL + '/dashboard');
    }

    @Post('/otp/request')
    @HttpCode(HttpStatus.OK)
    async requestOTP(@Body() dto: OtpRequestDto) {
        await this.authService.requestOTP(dto.email, dto.password);
        return ApiResponse.success(null, 'Successfully send OTP. Check your email.');
    }

    @Post('/otp/verify')
    @HttpCode(HttpStatus.OK)
    async verifyOTP(@Body() dto: OtpVerifyDto) {
        if (await this.authService.verifyOTP(dto.email, dto.code))
            return ApiResponse.success(null, 'Successfully verify OTP.');

        throw new BadRequestException('Failed to verify OTP.');
    }
}