import {Global, Module} from "@nestjs/common";
import {HashingService} from "./services/hashing.service";
import {RedisService} from "./services/redis.service";
import {MailService} from "./services/mail/mail.service";

@Global()
@Module({
    providers: [HashingService, RedisService, MailService],
    exports: [HashingService, RedisService, MailService],
})
export class CommonModule {
}