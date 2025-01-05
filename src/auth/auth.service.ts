import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/user/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, { secret: 'secret' }),
    };
  }

  async register(
    email: string,
    username: string,
    password: string,
  ): Promise<User> {
    const existingEmail = await this.userRepository.findOneBy({ email });

    if (existingEmail) {
      throw new BadRequestException(
        'This is an email that you have already signed up for.',
      );
    }

    const existingUsername = await this.userRepository.findOneBy({ username });

    if (existingUsername) {
      throw new BadRequestException(
        'This is an username that you have already signed up for.',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = this.userRepository.save({
      email,
      username,
      password: hashedPassword,
    });

    return newUser;
  }
}
