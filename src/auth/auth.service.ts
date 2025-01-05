import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { GetUserDto } from './dto/get-user.dto';
import { instanceToPlain } from 'class-transformer';
import { Profile } from 'src/profile/entities/profile.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: User, response: Response) {
    const tokenPayload = {
      userId: user.id,
    };

    const expires = new Date();
    expires.setSeconds(
      expires.getSeconds() + this.configService.get('JWT_EXPIRATION'),
    );

    const token = this.jwtService.sign(tokenPayload);

    response.cookie('Authentication', token, {
      httpOnly: true,
      expires,
    });

    return { access_token: token };
  }

  async register(registerDto: RegisterDto): Promise<User> {
    const existingEmail = await this.userRepository.findOneBy({
      email: registerDto.email,
    });

    if (existingEmail) {
      throw new UnprocessableEntityException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const newUser = this.userRepository.save({
      ...registerDto,
      password: hashedPassword,
    });

    return newUser;
  }
  async getUser(getUserDto: GetUserDto) {
    return instanceToPlain(
      this.userRepository.findOneBy({ id: getUserDto.id }),
    );
  }

  async getUserWithProfile(getUserDto: GetUserDto) {
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
