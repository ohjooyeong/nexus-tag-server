import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/entities/profile.entity';
import { ProfileService } from 'src/profile/profile.service';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { User } from '../entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile, WorkspaceMember])],
  controllers: [UserController],
  providers: [UserService, ProfileService],
})
export class UserModule {}
