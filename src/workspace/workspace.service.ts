import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { Workspace } from '../entities/workspace.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { Role, WorkspaceMember } from 'src/entities/workspace-member.entity';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,

    private readonly dataSource: DataSource,
  ) {}

  async createWorkspace(workspaceName: string, userDto: User) {
    const workspace = await this.dataSource.transaction(async (manager) => {
      try {
        const workspace = await this.syncCreateWorkspace(
          manager,
          workspaceName,
          userDto,
        );

        await this.syncCreateWorkspaceMember(manager, userDto, workspace);

        return workspace;
      } catch (error) {
        if (error instanceof UnprocessableEntityException) {
          throw error;
        }

        // 데이터베이스 에러
        if (error.code === '23505') {
          // PostgreSQL 고유 키 중복 에러 코드
          throw new BadRequestException('Duplicate data detected');
        }

        console.error('Unexpected error during creation:', error);
        throw new InternalServerErrorException('An unexpected error occurred');
      }
    });

    return workspace;
  }

  private async syncCreateWorkspace(manager, workspaceName, user) {
    try {
      const workspace = this.workspaceRepository.create({
        name: workspaceName,
        description: '',
        owner: user,
      });

      return await manager.save(workspace);
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw new InternalServerErrorException('Failed to create workspace');
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

  async setDefaultWorkspace(workspaceId: string, user: User) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    // 유저가 해당 워크스페이스의 멤버인지 확인
    const isMember = await this.workspaceMemberRepository.findOne({
      where: { user: { id: user.id }, workspace: { id: workspaceId } },
    });

    if (!isMember) {
      throw new ForbiddenException('You are not a member of this workspace');
    }

    // 기본 워크스페이스 설정
    user.defaultWorkspace = workspace;
    await this.userRepository.save(user);

    return workspaceId;
  }

  async getWorkspaces(user: User) {
    const workspaces = await this.workspaceMemberRepository.find({
      where: { user: { id: user.id } },
      relations: ['workspace'],
    });

    return workspaces
      .map((member) => member.workspace)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getWorkspaceById(
    workspaceId: string,
    userId: string,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['members', 'members.user', 'owner'], // user 정보까지 가져오는거
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    //  members 배열이 올바르게 로드되지 않았을 경우 예외 처리
    if (!workspace.members) {
      throw new ForbiddenException('Invalid workspace data');
    }

    const isMember = workspace.members.some(
      (member) => member.user && member.user.id === userId, //  member.user가 존재하는지 확인
    );

    if (!isMember) {
      throw new ForbiddenException('You do not have access to this workspace');
    }

    return workspace;
  }

  async getDefaultWorkspace(user: User): Promise<Workspace> {
    if (!user.defaultWorkspace) {
      const userOwnedWorkspaces = await this.workspaceRepository.find({
        where: { owner: { id: user.id } },
      });

      if (userOwnedWorkspaces.length > 0) {
        // 유저가 생성한 워크스페이스 중 첫 번째를 기본값으로 설정
        user.defaultWorkspace = userOwnedWorkspaces[0];
        await this.userRepository.save(user);
        return user.defaultWorkspace;
      } else {
        throw new NotFoundException(
          'No default workspace found, and no owned workspaces exist.',
        );
      }
    }

    return user.defaultWorkspace;
  }

  async updateWorkspace(
    workspaceId: string,
    userId: string,
    updateData: UpdateWorkspaceDto,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['owner'],
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found');
    }

    if (workspace.owner.id !== userId) {
      throw new ForbiddenException('You do not own this workspace');
    }

    // 워크스페이스 정보 업데이트
    workspace.name = updateData.name ?? workspace.name;
    workspace.description = updateData.description ?? workspace.description;

    return await this.workspaceRepository.save(workspace);
  }

  async deleteWorkspace(workspaceId: string, userId: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    // 트랜잭션 시작
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = await queryRunner.manager.findOne(User, {
        where: { id: userId },
        relations: ['ownedWorkspaces'],
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const workspace = await queryRunner.manager.findOne(Workspace, {
        where: { id: workspaceId },
        relations: ['owner', 'members'],
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      if (workspace.owner.id !== userId) {
        throw new ForbiddenException('You do not own this workspace');
      }

      // 유저가 소유한(Owner인) 워크스페이스 개수 확인
      if (user.ownedWorkspaces.length <= 1) {
        throw new ForbiddenException('You must own at least one workspace');
      }

      // 기본 워크스페이스 업데이트 (삭제된 경우)
      if (user.defaultWorkspace.id === workspaceId) {
        const remainingOwnedWorkspaces = user.ownedWorkspaces.filter(
          (w) => w.id !== workspaceId,
        );
        user.defaultWorkspace = remainingOwnedWorkspaces[0] || null;
        await queryRunner.manager.save(user);
      }

      // 워크스페이스 삭제
      await queryRunner.manager.remove(workspace);

      // 트랜잭션 커밋
      await queryRunner.commitTransaction();
    } catch (error) {
      // 트랜잭션 롤백
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // 연결 해제
      await queryRunner.release();
    }
  }

  async getWorkspaceMembers(workspaceId: string) {
    const workspaceMembers = await this.workspaceMemberRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['user'],
    });

    if (!workspaceMembers) {
      throw new NotFoundException('Workspace members not found');
    }

    const transformedMembers = workspaceMembers.map((member) => ({
      id: member.id,
      email: member.user.email,
      username: member.user.username,
      userId: member.user.id,
      role: member.role,
    }));

    return transformedMembers;
  }
}
