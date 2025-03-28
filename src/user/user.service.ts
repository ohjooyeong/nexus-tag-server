import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { instanceToPlain } from 'class-transformer';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUserWithProfile(getUserDto: { id: string }) {
    const user = await this.userRepository.findOne({
      where: { id: getUserDto.id },
      relations: ['profile'], // 관계된 엔티티를 로드
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // password를 exclude 했는데 password가 나오는 현상때문에
    // instanceToPlain 메서드를 활용함.
    return instanceToPlain(user);
  }

  async updateUserPassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Block password change for Google provider users
    if (user.provider === 'google') {
      throw new Error('Google account users cannot change their password');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    const newUser = await this.userRepository.save(user);

    return instanceToPlain(newUser);
  }

  async updateUserProfile(
    userId: string,
    // profileImage: string,
    username: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['profile'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // user.profile.profileImg = profileImage;
    user.username = username;

    const newUser = await this.userRepository.save(user);

    return instanceToPlain(newUser);
  }
}
