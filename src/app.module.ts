import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { WorkspaceModule } from './workspace/workspace.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from './project/project.module';
import { Workspace } from './entities/workspace.entity';
import { Project } from './entities/project.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './entities/user.entity';
import { ProfileModule } from './profile/profile.module';
import { ConfigModule } from '@nestjs/config';
import { Profile } from './entities/profile.entity';
import { Invitation } from './entities/invitation.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { MailModule } from './mail/mail.module';
import { EmailVerification } from './entities/email-verification.entity';
import { EmailVerificationModule } from './email-verification/email-verification.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      synchronize: true, // production 때는 false
      entities: [
        Workspace,
        Project,
        User,
        Profile,
        Invitation,
        WorkspaceMember,
        EmailVerification,
      ],
    }),

    WorkspaceModule,
    ProjectModule,
    AuthModule,
    UserModule,
    ProfileModule,
    MailModule,
    EmailVerificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
