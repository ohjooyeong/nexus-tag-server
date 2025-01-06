import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/profile/entities/profile.entity';
import { ProfileService } from 'src/profile/profile.service';
import { WorkspaceMember } from 'src/workspace/entities/workspace-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, WorkspaceMember])],
  controllers: [UserController],
  providers: [UserService, ProfileService],
})
export class UserModule {}
