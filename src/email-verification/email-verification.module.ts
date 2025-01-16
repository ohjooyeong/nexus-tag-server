import { Module } from '@nestjs/common';
import { EmailVerificationService } from './email-verification.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmailVerification } from 'src/entities/email-verification.entity';
import { User } from 'src/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EmailVerification, User])],
  providers: [EmailVerificationService],
  exports: [EmailVerificationService],
})
export class EmailVerificationModule {}
