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
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Profile } from './entities/profile.entity';
import { WorkspaceMember } from './entities/workspace-member.entity';
import { MailModule } from './mail/mail.module';
import { EmailVerification } from './entities/email-verification.entity';
import { EmailVerificationModule } from './email-verification/email-verification.module';
import { Annotation } from './entities/annotation.entity';
import { ClassLabel } from './entities/class-label.entity';
import { DataItem } from './entities/data-item.entity';
import { Dataset } from './entities/dataset.entity';
import { DatasetModule } from './project/dataset/dataset.module';
import { DataItemModule } from './project/data-item/data-item.module';
import { ClassLabelModule } from './project/class-label/class-label.module';
import { DashboardModule } from './project/dashboard/dashboard.module';
import { AwsS3Service } from './aws/aws-s3.service';
import { AnnotationModule } from './project/annotation/annotation.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: 'postgres',
        port: 5432,
        username: configService.get('POSTGRES_USER'),
        password: configService.get('POSTGRES_PASSWORD'),
        database: configService.get('POSTGRES_DB'),
        synchronize: true, // production 때는 false
        entities: [
          Workspace,
          Project,
          User,
          Profile,
          WorkspaceMember,
          EmailVerification,
          Annotation,
          ClassLabel,
          DataItem,
          Dataset,
        ],
      }),
      inject: [ConfigService],
    }),

    WorkspaceModule,
    ProjectModule,
    AuthModule,
    UserModule,
    ProfileModule,
    MailModule,
    EmailVerificationModule,
    DatasetModule,
    DataItemModule,
    ClassLabelModule,
    DashboardModule,
    AnnotationModule,
  ],
  controllers: [AppController],
  providers: [AppService, AwsS3Service],
})
export class AppModule {}
