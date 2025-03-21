import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { LocalStrategy } from './strategy/local.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Workspace } from 'src/entities/workspace.entity';
import { Project } from 'src/entities/project.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Profile } from 'src/entities/profile.entity';
import { EmailVerification } from 'src/entities/email-verification.entity';
import { EmailVerificationModule } from 'src/email-verification/email-verification.module';
import { MailModule } from 'src/mail/mail.module';
import { GoogleStrategy } from './strategy/google.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Workspace,
      Project,
      WorkspaceMember,
      Profile,
      EmailVerification,
    ]),
    EmailVerificationModule,
    MailModule,
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
        global: true,
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, GoogleStrategy],
  exports: [JwtStrategy],
})
export class AuthModule {}
