import {Injectable} from '@nestjs/common';
import Redis from 'ioredis';
import {RedisService} from "../../common/services/redis.service";


@Injectable()
export class TokenBlacklistService {
    private readonly prefix = 'blacklist:';

    constructor(private readonly redisService: RedisService) {
    }

    async blacklistToken(token: string, expTimestamp: number): Promise<void> {
        const redisClient: Redis = this.redisService.getClient();
        // Store the token in Redis with an expiry matching its lifetime
        const ttl = expTimestamp - Math.floor(Date.now() / 1000); // remaining seconds
        if (ttl > 0) {
            await redisClient.set(`${this.prefix}${token}`, 'blacklisted', 'EX', ttl);
        }
    }

    async isTokenBlacklisted(token: string): Promise<boolean> {
        const redisClient: Redis = this.redisService.getClient();
        const result = await redisClient.get(`${this.prefix}${token}`);
        return result === 'blacklisted';
    }
}
