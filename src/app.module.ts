import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggerModule } from 'nestjs-pino';
import { WorkspaceModule } from './workspace/workspace.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectModule } from './project/project.module';
import { Workspace } from './workspace/entities/workspace.entity';
import { Project } from './project/entities/project.entity';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { User } from './user/entities/user.entity';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [
    LoggerModule.forRoot(),
    WorkspaceModule,
    ProjectModule,
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'postgres',
      port: 5432,
      username: 'postgres',
      password: 'postgres',
      database: 'postgres',
      synchronize: true, // production 때는 false
      entities: [Workspace, Project, User],
    }),
    AuthModule,
    UserModule,
    ProfileModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
