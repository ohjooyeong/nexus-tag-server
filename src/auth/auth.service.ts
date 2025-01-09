import {
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

import { Workspace } from 'src/workspace/entities/workspace.entity';
import { Project } from 'src/project/entities/project.entity';
import {
  Role,
  WorkspaceMember,
} from 'src/workspace/entities/workspace-member.entity';

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

  async register(registerDto: RegisterDto) {
    const existingEmail = await this.userRepository.findOneBy({
      email: registerDto.email,
    });

    if (existingEmail) {
      throw new UnprocessableEntityException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const createUser = this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(createUser);

    // 2. 기본 워크스페이스 생성
    const workspace = this.workspaceRepository.create({
      name: 'Default Workspace',
      description: 'This is a built-in workspace.',
      owner: savedUser,
    });

    // 3. 기본 프로젝트 생성
    const project = this.projectRepository.create({
      name: 'Default Project',
      workspace,
    });
    workspace.projects = [project];

    // 4. 워크스페이스 멤버 생성
    const workspaceMember = this.workspaceMemberRepository.create({
      workspace,
      user: savedUser,
      role: Role.OWNER, // 소유자는 기본적으로 OWNER
    });
    workspace.members = [workspaceMember];

    await this.workspaceRepository.save(workspace);

    return instanceToPlain(savedUser);
  }

  async logout(response: Response): Promise<void> {
    response.clearCookie('Authentication', { httpOnly: true });
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
}
