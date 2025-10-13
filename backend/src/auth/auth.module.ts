import {Module} from "@nestjs/common";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {HashingService} from "../../common/services/hashing.service";
import {PrismaService} from "../../prisma/prisma.service";

@Module({
    providers: [AuthService, HashingService, PrismaService],
    controllers: [AuthController]
})
export class AuthModule {
}