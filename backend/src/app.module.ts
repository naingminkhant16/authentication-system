import {Module} from '@nestjs/common';
import {PrismaService} from "../prisma/prisma.service";
import {AuthModule} from "./auth/auth.module";
import {CommonModule} from "./common/common.module";
import {DepartmentModule} from "./department/department.module";
import {JwtModule} from "@nestjs/jwt";
import {PassportModule} from "@nestjs/passport";

@Module({
    imports: [
        AuthModule,
        DepartmentModule,
        CommonModule,
        PassportModule,
        JwtModule.register({
            global: true,
            secret: process.env.JWT_SECRET,
            signOptions: {expiresIn: '1h'},
        }),
    ],
    controllers: [],
    providers: [PrismaService],
    exports: [PrismaService],
})
export class AppModule {
}
