import {Injectable} from "@nestjs/common";
import {PrismaService} from "../../prisma/prisma.service";

@Injectable()
export class DepartmentService {
    constructor(private readonly prismaService: PrismaService) {
    }

    async getAll(search: string = '') {
        return this.prismaService.department.findMany({
            where: {
                name: {contains: search},
            }
        });
    }
}