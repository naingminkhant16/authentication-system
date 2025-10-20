import {Module} from "@nestjs/common";
import {AuthController} from "./auth.controller";
import {AuthService} from "./auth.service";
import {HashingService} from "../../common/services/hashing.service";
import {PrismaService} from "../../prisma/prisma.service";
import {JwtStrategy} from "./jwt.strategy";
import {TokenBlacklistService} from "./token-blacklist-service";
import {MailService} from "../../common/services/mail/mail.service";

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        HashingService,
        PrismaService,
        JwtStrategy,
        TokenBlacklistService,
        MailService
    ],
})
export class AuthModule {
}