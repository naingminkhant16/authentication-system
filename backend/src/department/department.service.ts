import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class DepartmentService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async getAll() {
        const departments = await this.prismaService.department.findMany();

        return departments;
    }
}