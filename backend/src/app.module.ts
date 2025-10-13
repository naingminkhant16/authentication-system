import {Module} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {AuthModule} from "./auth/auth.module";
import {CommonModule} from "../common/common.module";
import {DepartmentModule} from "./department/department.module";

@Module({
    imports: [AuthModule, DepartmentModule, CommonModule],
    controllers: [],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class AppModule {
}
