import { Module } from '@nestjs/common';
import { WorkspaceService } from './workspace.service';
import { WorkspaceController } from './workspace.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from '../entities/workspace.entity';
import { AuthModule } from 'src/auth/auth.module';
import { WorkspaceMember } from '../entities/workspace-member.entity';
import { User } from 'src/entities/user.entity';
import { Invitation } from '../entities/invitation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, WorkspaceMember, User, Invitation]),
    AuthModule,
  ],
  controllers: [WorkspaceController],
  providers: [WorkspaceService],
})
export class WorkspaceModule {}
