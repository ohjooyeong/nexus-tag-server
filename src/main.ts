import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config({ path: '.env' });

async function bootstrap() {
  // HTTPS 인증서 옵션 추가
  let app;

  if (process.env.NODE_ENV === 'production') {
    const httpsOptions = {
      key: fs.readFileSync('/app/ssl/key.pem'),
      cert: fs.readFileSync('/app/ssl/cert.pem'),
    };
    app = await NestFactory.create(AppModule, { httpsOptions });
  } else {
    app = await NestFactory.create(AppModule);
  }

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

  app.enableCors({
    origin: ['http://localhost:3000', 'https://nexus-tag.vercel.app'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Static 파일 서빙 설정 수정
  app.use(
    '/uploads',
    (req, res, next) => {
      const origin = req.headers.origin;
      if (
        origin &&
        ['http://localhost:3000', 'https://nexus-tag.vercel.app'].includes(
          origin,
        )
      ) {
        res.header('Access-Control-Allow-Origin', origin);
      }
      res.header('Access-Control-Allow-Credentials', 'true');
      next();
    },
    express.static(join(process.cwd(), 'uploads')),
  );
  await app.listen(process.env.PORT);
}
bootstrap();
