import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {RegisterDto} from "./dto/register.dto";
import {PrismaService} from "../../prisma/prisma.service";
import {Employee} from "@prisma/client";
import {HashingService} from "../../common/services/hashing.service";
import {LoginDto} from "./dto/login.dto";
import {JwtService} from "@nestjs/jwt";
import {Response} from 'express';
import {TokenBlacklistService} from "./token-blacklist-service";
import {MailService} from "../../common/services/mail/mail.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService,
        private readonly mailService: MailService,
    ) {
    }

    async register(registerDto: RegisterDto): Promise<Employee> {
        if (registerDto.password !== registerDto.confirmPassword)
            throw new BadRequestException("Passwords do not match");

        const department = await this.prismaService.department.findFirst({
            where: {id: registerDto.departmentId},
            select: {id: true, name: true}
        });

        if (!department) throw new BadRequestException("Department not found");

        const emailExist = await this.prismaService.employee.findFirst({
            where: {email: registerDto.email},
            select: {id: true}
        });
        if (emailExist) throw new BadRequestException("Email already exists");

        // Create unique employee id which is used to login along with password
        const employeeId = "E" + (Math.floor(Date.now() / 1000) % 10000).toString();

        // Hash password
        const password = await this.hashingService.hashPassword(registerDto.password);

        // Store in database
        const employee = await this.prismaService.employee.create({
            data: {
                departmentId: department.id,
                employeeId: employeeId,
                email: registerDto.email,
                name: registerDto.name,
                password
            }
        });

        // Store verify-jwt-token
        const verifyToken = await this.jwtService.signAsync(
            {sub: employee.id},
            {expiresIn: '1h'},
        );

        // Send verify email
        await this.mailService.sendVerifyMail(
            employee.email,
            employee.name,
            String(process.env.MAIL_VERIFY_URL) + '?token=' + verifyToken,
        );

        return employee;
    }


    async login(loginDto: LoginDto): Promise<{
        accessToken: string,
        refreshToken: string,
        auth: { id: number, name: string, email: string, employeeId: string, departmentName: string }
    }> {
        // retrieve employee
        const employee = await this.prismaService.employee.findFirst({
            where: {email: loginDto.email},
            include: {department: {select: {name: true}}}
        });

        if (!employee) throw new BadRequestException("Employee not found");
        // check if email is verified
        if (!employee.emailVerified) throw new BadRequestException("Email is not verified");

        // compare passwords
        if (!await this.hashingService.comparePassword(loginDto.password, employee.password))
            throw new BadRequestException("Password do not match");

        // Create token payload
        const payload = {
            sub: employee.id,
            auth: employee,
            system_name: process.env.APP_NAME,
            requested_at: new Date(),
        }

        // Create access token
        const accessToken = this.jwtService.sign(payload, {expiresIn: '5min'});
        // Create refresh token
        const refreshToken = this.jwtService.sign(payload, {expiresIn: '24h'});

        return {
            accessToken,
            refreshToken,
            auth: {
                id: employee.id,
                name: employee.name,
                email: employee.email,
                employeeId: employee.employeeId,
                departmentName: employee.department.name,
            }
        };
    }

    setRefreshTokenCookie(refreshToken: string, res: Response): void {
        // Set refresh token in http only cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.APP_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
    }

    async refreshToken(
        refreshToken: string,
    ): Promise<{ accessToken: string; newRefreshToken: string }> {

        const payload = await this.jwtService.verifyAsync(refreshToken);
        if (!payload) throw new UnauthorizedException('Invalid refresh token');

        // check if token is blacklisted
        const isBlacklisted = await this.tokenBlacklistService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted) throw new UnauthorizedException('Refresh token is blacklisted');

        // retrieve employee
        const employee = await this.prismaService.employee.findFirst({
            where: {id: payload.sub},
            include: {department: {select: {name: true}}}
        });
        if (!employee) throw new NotFoundException('User not found');

        // create new token payload
        const newPayload = {
            sub: employee.id,
            auth: employee,
            system_name: process.env.APP_NAME,
            requested_at: new Date(),
        };
        // create new access token
        const newAccessToken = this.jwtService.sign(newPayload, {
            expiresIn: '5min',
        });

        // create new refresh token
        const newRefreshToken = this.jwtService.sign(newPayload, {
            expiresIn: '24h',
        });

        // set old refresh token in blacklist
        await this.tokenBlacklistService.blacklistToken(refreshToken, payload.exp);

        return {
            accessToken: newAccessToken,
            newRefreshToken,
        };
    }

    async logout(refreshToken: string, res: Response): Promise<void> {
        // Clear cookie
        res.clearCookie('refresh_token', {
            httpOnly: true,
            secure: process.env.APP_ENV === 'production',
            sameSite: 'strict',
        });

        // retrieve token payload
        const payload = await this.jwtService.verifyAsync(refreshToken);
        if (!payload) throw new UnauthorizedException('Invalid refresh token');

        // Blacklist token
        await this.tokenBlacklistService.blacklistToken(refreshToken, payload.exp);
    }

    async verifyMail(token: string) {
        const payload = await this.jwtService.verifyAsync(token);

        if (!payload) throw new BadRequestException('Invalid verification token');

        await this.prismaService.employee.update({
            where: {id: payload.sub},
            data: {emailVerified: true}
        });
    }
}