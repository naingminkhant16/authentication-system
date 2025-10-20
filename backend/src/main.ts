import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import * as cookieParser from 'cookie-parser';
import {ValidationPipe} from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.enableCors({
        origin: [process.env.FRONTEND_URL ?? 'http://localhost:3000'],
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true,
    });
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
    }));
    app.use(cookieParser());
    await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
