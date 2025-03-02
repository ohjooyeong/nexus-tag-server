import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useLogger(app.get(Logger));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // DTO에 없는 속성은 무조건 거른다.
      forbidNonWhitelisted: true, // 전달하는 요청 값 중에 정의 되지 않은 값이 있으면 Error를 발생합니다.
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  // 정적 파일 제공 설정

  app.enableCors({
    origin: ['http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true, // 쿠키 전송 허용
  });
  // Static 파일 서빙 설정
  app.use(
    '/uploads',
    (req, res, next) => {
      res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    },
    express.static(join(process.cwd(), 'uploads')),
  );
  await app.listen(8080);
}
bootstrap();
