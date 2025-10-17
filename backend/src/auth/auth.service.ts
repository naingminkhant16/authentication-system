import {BadRequestException, Injectable, NotFoundException, UnauthorizedException} from "@nestjs/common";
import {RegisterDto} from "./dto/register.dto";
import {PrismaService} from "../../prisma/prisma.service";
import {Employee} from "@prisma/client";
import {HashingService} from "../../common/services/hashing.service";
import {LoginDto} from "./dto/login.dto";
import {JwtService} from "@nestjs/jwt";
import {Response} from 'express';
import {TokenBlacklistService} from "./token-blacklist-service";

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        private readonly tokenBlacklistService: TokenBlacklistService,
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

        const employeeId = "E" + (Math.floor(Date.now() / 1000) % 10000).toString();
        const password = await this.hashingService.hashPassword(registerDto.password);

        return this.prismaService.employee.create({
            data: {
                departmentId: department.id,
                employeeId: employeeId,
                name: registerDto.name,
                password
            }
        });
    }


    async login(loginDto: LoginDto): Promise<{
        accessToken: string,
        refreshToken: string,
        auth: { id: number, name: string, employeeId: string, departmentName: string }
    }> {
        const employee = await this.prismaService.employee.findFirst({
            where: {employeeId: loginDto.employeeId},
            include: {department: {select: {name: true}}}
        });

        if (!employee) throw new BadRequestException("Employee not found");

        if (!await this.hashingService.comparePassword(loginDto.password, employee.password))
            throw new UnauthorizedException("Password do not match");

        const payload = {
            sub: employee.id,
            auth: employee
        }

        const accessToken = this.jwtService.sign(payload, {expiresIn: '5min'});
        const refreshToken = this.jwtService.sign(payload, {expiresIn: '24h'});

        return {
            accessToken,
            refreshToken,
            auth: {
                id: employee.id,
                name: employee.name,
                employeeId: employee.employeeId,
                departmentName: employee.department.name,
            }
        };
    }

    setRefreshTokenCookie(refreshToken: string, res: Response): void {
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
        const isBlacklisted =
            await this.tokenBlacklistService.isTokenBlacklisted(refreshToken);
        if (isBlacklisted)
            throw new UnauthorizedException('Refresh token is blacklisted');

        const employee = await this.prismaService.employee.findFirst({
            where: {id: payload.sub},
            include: {department: {select: {name: true}}}
        });

        if (!employee) throw new NotFoundException('User not found');

        const newPayload = {
            sub: employee.id,
            auth: employee
        };

        const newAccessToken = this.jwtService.sign(newPayload, {
            expiresIn: '5min',
        });

        const newRefreshToken = this.jwtService.sign(newPayload, {
            expiresIn: '24h',
        });

        // blacklist the old refresh token
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
}