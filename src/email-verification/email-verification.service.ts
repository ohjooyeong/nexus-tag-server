import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { randomBytes } from 'crypto';
import { User } from 'src/entities/user.entity';
import { EmailVerification } from 'src/entities/email-verification.entity';

@Injectable()
export class EmailVerificationService {
  constructor(
    @InjectRepository(EmailVerification)
    private readonly emailVerificationRepository: Repository<EmailVerification>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async generateToken(user: User): Promise<string> {
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes TTL

    const emailVerification = this.emailVerificationRepository.create({
      token,
      expiresAt,
      user,
    });
    await this.emailVerificationRepository.save(emailVerification);

    return token;
  }

  async verifyToken(token: string): Promise<void> {
    const verification = await this.emailVerificationRepository.findOne({
      where: { token },
      relations: ['user'],
    });

    if (!verification) {
      throw new NotFoundException('Invalid token');
    }

    if (verification.isUsed || verification.expiresAt < new Date()) {
      throw new BadRequestException('Token is expired or already used');
    }

    verification.isUsed = true;
    verification.user.isEmailVerified = true;

    await this.emailVerificationRepository.save(verification);
    await this.userRepository.save(verification.user);
  }
}
