import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { Workspace } from 'src/entities/workspace.entity';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Annotation } from 'src/entities/annotation.entity';
import { DataItem } from 'src/entities/data-item.entity';
import { Dataset } from 'src/entities/dataset.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Workspace,
      User,
      WorkspaceMember,
      Dataset,
      DataItem,
      Annotation,
    ]),
    AuthModule,
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
  exports: [DashboardService],
})
export class DashboardModule {}
