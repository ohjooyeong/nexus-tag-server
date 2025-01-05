import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from 'src/profile/entities/profile.entity';
import { ProfileService } from 'src/profile/profile.service';

@Module({
  imports: [TypeOrmModule.forFeature([Profile])],
  controllers: [UserController],
  providers: [UserService, ProfileService],
})
export class UserModule {}
