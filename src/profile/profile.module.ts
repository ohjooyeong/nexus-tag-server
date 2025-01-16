import { Module } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ProfileController } from './profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Profile } from '../entities/profile.entity';
import { User } from 'src/entities/user.entity';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';

import { Workspace } from 'src/entities/workspace.entity';
import { Project } from 'src/entities/project.entity';
import { Invitation } from 'src/entities/invitation.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      Project,
      User,
      Profile,
      Invitation,
      WorkspaceMember,
    ]),
    PassportModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_EXPIRATION')}s`,
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
