import {Injectable, OnModuleDestroy, OnModuleInit} from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: Redis;

    onModuleInit() {
        console.log('Redis module initialized');
        this.client = new Redis({
            host: process.env.REDIS_HOST
        });
        this.client.on('connect', () => console.log('Redis connected successfully'));
        this.client.on('error', (err) => console.error('Redis connection error:', err));
    }

    async onModuleDestroy() {
        console.log('Redis module destroyed');
        await this.client.quit();
    }

    getClient(): Redis {
        return this.client;
    }
}
