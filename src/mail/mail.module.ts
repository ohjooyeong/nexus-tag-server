import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MailerModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        transport: {
          host: 'smtp.naver.com',
          port: 587,
          secure: false,
          auth: {
            user: configService.get('EMAIL_USER'), // 환경 변수에 이메일 주소 저장
            pass: configService.get('EMAIL_PASS'), // 환경 변수에 비밀번호 또는 앱 비밀번호 저장
          },
        },

        defaults: {
          from: configService.get('EMAIL_USER'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [MailService],
  exports: [MailService],
})
export class MailModule {}
