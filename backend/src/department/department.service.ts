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

    async getDepartmentEmployeesById(id: number) {
        return this.prismaService.department.findFirst({
            where: {id: Number(id)},
            include: {
                employees: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        employeeId: true,
                    }
                }
            },
        });
    }
}