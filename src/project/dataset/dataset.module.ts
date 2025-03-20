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
import { DataItem } from 'src/entities/data-item.entity';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Project,
      Workspace,
      User,
      WorkspaceMember,
      Dataset,
      DataItem,
    ]),
    AuthModule,
  ],
  controllers: [DatasetController],
  providers: [DatasetService, AwsS3Service],
})
export class DatasetModule {}
