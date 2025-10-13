import {Module} from "@nestjs/common";
import {DepartmentController} from "./department.controller";
import {DepartmentService} from "./department.service";
import {PrismaService} from "../../prisma/prisma.service";

@Module({
    providers: [DepartmentService, PrismaService],
    controllers: [DepartmentController],
})
export class DepartmentModule {
}