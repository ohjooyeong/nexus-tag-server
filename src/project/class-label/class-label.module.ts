import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { Workspace } from 'src/entities/workspace.entity';
import { User } from 'src/entities/user.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Dataset } from 'src/entities/dataset.entity';

import { AuthModule } from 'src/auth/auth.module';
import { ClassLabel } from 'src/entities/class-label.entity';
import { DataItem } from 'src/entities/data-item.entity';
import { ClassLabelController } from './class-label.controller';
import { ClassLabelService } from './class-label.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Workspace,
      User,
      WorkspaceMember,
      Dataset,
      ClassLabel,
      DataItem,
    ]),
    AuthModule,
  ],
  controllers: [ClassLabelController],
  providers: [ClassLabelService],
  exports: [ClassLabelService],
})
export class ClassLabelModule {}
