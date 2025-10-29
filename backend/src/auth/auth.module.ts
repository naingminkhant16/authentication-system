import {Module} from "@nestjs/common";
import {AuthController} from "./auth.controller";
import {AuthService} from "./services/auth.service";
import {HashingService} from "../common/services/hashing.service";
import {PrismaService} from "../../prisma/prisma.service";
import {JwtStrategy} from "./strategies/jwt.strategy";
import {TokenBlacklistService} from "./services/token-blacklist-service";
import {MailService} from "../common/services/mail/mail.service";
import {GoogleOauthGuard} from "./guards/google-oauth.guard";
import {GoogleStrategy} from "./strategies/google.strategy";

@Module({
    controllers: [AuthController],
    providers: [
        AuthService,
        HashingService,
        PrismaService,
        JwtStrategy,
        TokenBlacklistService,
        MailService,
        GoogleOauthGuard,
        GoogleStrategy
    ],
})
export class AuthModule {
}