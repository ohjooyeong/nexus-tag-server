import { Module } from '@nestjs/common';
import { ProjectService } from './project.service';
import { ProjectController } from './project.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from 'src/entities/workspace.entity';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Project } from 'src/entities/project.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Project, Workspace, User, WorkspaceMember]),
    AuthModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
