import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Workspace } from 'src/entities/workspace.entity';
import { User } from 'src/entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Project } from 'src/entities/project.entity';
import { DatasetController } from './dataset.controller';
import { DatasetService } from './dataset.service';
import { Dataset } from 'src/entities/dataset.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Workspace,
      User,
      WorkspaceMember,
      Dataset,
    ]),
    AuthModule,
  ],
  controllers: [DatasetController],
  providers: [DatasetService],
})
export class DatasetModule {}
