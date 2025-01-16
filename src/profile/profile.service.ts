import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { Profile } from '../entities/profile.entity';

@Injectable()
export class ProfileService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  // 회원가입 시 profile 초기화
  async initUserProfile(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('Not found user');
    }

    let profile = user.profile;

    if (!profile) {
      profile = this.profileRepository.create({
        profileImg: null,
        status: 'ACTIVE',
        user,
      });
    }
    const savedProfile = await this.profileRepository.save(profile);

    user.profile = savedProfile;
    await this.userRepository.save(user);

    return savedProfile;
  }

  async setUserProfile(userId: string, profileData: Partial<Profile>) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    let profile = user.profile;

    if (profile) {
      // Update existing profile
      profile = { ...profile, ...profileData };
    } else {
      // Create new profile
      profile = this.profileRepository.create(profileData);
    }

    const savedProfile = await this.profileRepository.save(profile);
    user.profile = savedProfile;
    await this.userRepository.save(user);

    return savedProfile;
  }
}
