import * as cookieParser from 'cookie-parser';
import {ValidationPipe} from "@nestjs/common";
import * as session from 'express-session';
import * as passport from 'passport';
import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';

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
    app.use(session({
        secret: process.env.SESSION_SECRET || '',
        resave: false,
        saveUninitialized: false,
        cookie: {secure: false},
    }))
    app.use(passport.initialize());
    app.use(passport.session());
    await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
