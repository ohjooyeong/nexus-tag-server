import {
  BadRequestException,
  HttpException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { ConfigService } from '@nestjs/config';
import { GetUserDto } from './dto/get-user.dto';
import { instanceToPlain } from 'class-transformer';

import { Workspace } from 'src/entities/workspace.entity';
import { Project } from 'src/entities/project.entity';
import { Role, WorkspaceMember } from 'src/entities/workspace-member.entity';
import { EmailVerificationService } from 'src/email-verification/email-verification.service';
import { MailService } from 'src/mail/mail.service';
import { emailTemplates } from 'src/mail/mail-template';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,

    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly emailVerificationService: EmailVerificationService,
    private readonly mailService: MailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOneBy({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }

    return null;
  }

  async validateToken(token: string): Promise<any> {
    try {
      const payload = this.jwtService.verify(token);
      return { userId: payload.userId };
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  async login(user: User) {
    if (!user.isEmailVerified) {
      await this.sendEmailVerification(user, 'en');
      throw new HttpException(
        {
          status: 450,
          message:
            'Email is not verified. A verification email has been sent. Please verify your email before logging in.',
        },
        450,
      );
    }

    const tokenPayload = {
      userId: user.id,
    };

    const expirationInSeconds = Number(
      this.configService.get('JWT_EXPIRATION'),
    );

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expirationInSeconds);

    const token = this.jwtService.sign(tokenPayload);

    return {
      access_token: token,
      expires_at: expiresAt.getTime(), // Unix timestamp로 변환
      expires_in: expirationInSeconds,
    };
  }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.findOneBy({
      email: registerDto.email,
    });

    if (existingUser && existingUser.provider === 'google') {
      throw new UnprocessableEntityException(
        'This email is already registered with Google. Please use Google Sign-In.',
      );
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 트랜잭션 사용
    const user = await this.dataSource.transaction(async (manager) => {
      try {
        // SRP에 따라 메서드 분리함.
        // 중간에 예외가 발생하면 데이터가 저장되지 않게 만듬.
        // 데이터를 save 하지않으면 각 관계에 대한 ID가 만들어지지 않아서 오류가 발생함.
        const user = await this.syncCreateUser(
          manager,
          registerDto,
          hashedPassword,
        );

        const workspace = await this.syncCreateDefaultWorkspace(manager, user);

        const workspaceMember = await this.syncCreateWorkspaceMember(
          manager,
          user,
          workspace,
        );

        await this.syncCreateDefaultProject(
          manager,
          workspace,
          workspaceMember,
        );

        return user;
      } catch (error) {
        if (error instanceof UnprocessableEntityException) {
          throw error;
        }

        // 데이터베이스 에러
        if (error.code === '23505') {
          // PostgreSQL 고유 키 중복 에러 코드
          throw new BadRequestException('Duplicate data detected');
        }

        console.error('Unexpected error during registration:', error);
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    });

    try {
      await this.sendEmailVerification(user, 'en');
    } catch (error) {
      console.error('Error sending verification email', error.message);
    }
    return instanceToPlain(user);
  }

  async googleLogin(profile: any) {
    const existingUser = await this.userRepository.findOne({
      where: [{ providerId: profile.providerId }, { email: profile.email }],
      relations: ['defaultWorkspace'],
    });

    // 기존 사용자일 경우
    if (existingUser) {
      if (existingUser.provider === 'local') {
        // 로컬 계정을 구글 계정으로 전환
        existingUser.provider = 'google';
        existingUser.providerId = profile.providerId;
        existingUser.isEmailVerified = true;
        await this.userRepository.save(existingUser);
        return this.login(existingUser);
      } else if (
        existingUser.provider === 'google' &&
        existingUser.providerId !== profile.providerId
      ) {
        // 기존 구글 계정의 providerId 업데이트
        existingUser.providerId = profile.providerId;
        await this.userRepository.save(existingUser);
      }
      const loginResponse = await this.login(existingUser);

      return {
        ...loginResponse,
      };
    }

    // 새 사용자 생성
    const user = await this.dataSource.transaction(async (manager) => {
      try {
        const user = await this.syncCreateUser(
          manager,
          {
            email: profile.email,
            username: profile.username,
            password: '', // Google 로그인은 비밀번호 불필요
            provider: 'google',
            googleId: profile.googleId,
            isEmailVerified: true,
          },
          '',
        );

        const workspace = await this.syncCreateDefaultWorkspace(manager, user);
        const workspaceMember = await this.syncCreateWorkspaceMember(
          manager,
          user,
          workspace,
        );
        await this.syncCreateDefaultProject(
          manager,
          workspace,
          workspaceMember,
        );

        return user;
      } catch (error) {
        console.error('Error during Google sign-up:', error);
        throw new InternalServerErrorException('Failed to create user account');
      }
    });

    return this.login(user);
  }

  private async syncCreateUser(manager, userData: any, hashedPassword: string) {
    try {
      const user = this.userRepository.create({
        ...userData,
        password: hashedPassword,
      });
      return await manager.save(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  private async syncCreateDefaultWorkspace(manager, user) {
    try {
      const workspace = this.workspaceRepository.create({
        name: 'Default Workspace',
        description: 'This is a built-in workspace.',
        owner: user,
      });
      return await manager.save(workspace);
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw new InternalServerErrorException('Failed to create workspace');
    }
  }

  private async syncCreateDefaultProject(manager, workspace, workspaceMember) {
    try {
      const project = this.projectRepository.create({
        name: 'Default Project',
        description: 'This is a default project description.',
        workspace,
        createdBy: workspaceMember,
      });
      return await manager.save(project);
    } catch (error) {
      console.error('Error creating project:', error);
      throw new InternalServerErrorException('Failed to create project');
    }
  }

  private async syncCreateWorkspaceMember(manager, user, workspace) {
    try {
      const workspaceMember = this.workspaceMemberRepository.create({
        workspace,
        user,
        role: Role.OWNER,
      });
      return await manager.save(workspaceMember);
    } catch (error) {
      console.error('Error creating workspace member:', error);
      throw new InternalServerErrorException(
        'Failed to create workspace member',
      );
    }
  }

  async sendEmailVerification(user: User, language: string): Promise<void> {
    const token = await this.emailVerificationService.generateToken(user);
    const clientDomain = this.configService.get('CLIENT_DOMAIN');
    const verificationLink = `${clientDomain}/email-verify?token=${token}`;
    const template = emailTemplates[language] || emailTemplates.en;

    await this.mailService.sendEmail(
      user.email,
      template.subject,
      template.content(verificationLink),
    );
  }

  async resendVerificationEmail(user: User): Promise<void> {
    if (user.isEmailVerified) {
      throw new UnauthorizedException('Email is already verified.');
    }

    await this.sendEmailVerification(user, 'en');
  }

  async verifyEmail(token: string): Promise<void> {
    await this.emailVerificationService.verifyToken(token);
  }

  async logout() {
    // 클라이언트에서 토큰을 제거하므로 서버에서는 특별한 처리가 필요 없음
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

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({ where: { email } });
  }
}
