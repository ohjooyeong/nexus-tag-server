import { Module } from '@nestjs/common';
import { DataItemService } from './data-item.service';
import { DataItemController } from './data-item.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { Workspace } from 'src/entities/workspace.entity';
import { User } from 'src/entities/user.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Dataset } from 'src/entities/dataset.entity';
import { DataItem } from 'src/entities/data-item.entity';
import { AuthModule } from 'src/auth/auth.module';
import { Annotation } from 'src/entities/annotation.entity';

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
  controllers: [DataItemController],
  providers: [DataItemService],
  exports: [DataItemService],
})
export class DataItemModule {}
