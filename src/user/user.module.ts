import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/entities/profile.entity';
import { ProfileService } from 'src/profile/profile.service';

import { User } from '../entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([User, Profile]), AuthModule],
  controllers: [UserController],
  providers: [UserService, ProfileService],
})
export class UserModule {}
