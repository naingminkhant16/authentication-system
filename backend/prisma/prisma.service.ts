import {PrismaClient} from "@prisma/client";
import {Injectable, OnModuleDestroy, OnModuleInit} from "@nestjs/common";

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit(): Promise<void> {
        try {
            await this.$connect();
            console.log("Connected to Database Successfully!")
        } catch (err) {
            console.log("Failed to connect to Database!", err)
        }
    }

    async onModuleDestroy(): Promise<void> {
        await this.$disconnect();
        console.log("Disconnected from Database Successfully!")
    }
}