import {Global, Module} from "@nestjs/common";
import {HashingService} from "./services/hashing.service";
import {RedisService} from "./services/redis.service";

@Global()
@Module({
    providers: [HashingService, RedisService],
    exports: [HashingService, RedisService],
})
export class CommonModule {
}