import {BadRequestException, Injectable} from "@nestjs/common";
import {RegisterDto} from "./dto/register.dto";
import {PrismaService} from "../../prisma/prisma.service";
import {Employee} from "@prisma/client";
import {HashingService} from "../../common/services/hashing.service";

@Injectable()
export class AuthService {
    constructor(
        private readonly prismaService: PrismaService,
        private readonly hashingService: HashingService
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
}