import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { DataSource, Repository } from 'typeorm';
import { Workspace } from '../entities/workspace.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';

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

    return workspaces.map((member) => member.workspace);
  }

  async getWorkspaceById(
    workspaceId: string,
    userId: string,
  ): Promise<Workspace> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId, members: { user: { id: userId } } },
    });

    if (!workspace) {
      throw new NotFoundException('Workspace not found or access denied');
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

  async deleteWorkspace(workspaceId: string, user: User): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    // 트랜잭션 시작
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 워크스페이스 조회
      const workspace = await queryRunner.manager.findOne(Workspace, {
        where: { id: workspaceId },
        relations: ['members', 'members.user'],
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      if (workspace.owner.id !== user.id) {
        throw new ForbiddenException('You do not own this workspace');
      }

      // 워크스페이스 삭제
      await queryRunner.manager.remove(workspace);

      // 기본 워크스페이스가 삭제된 유저 처리
      const usersToUpdate = await queryRunner.manager.find(User, {
        where: { defaultWorkspace: { id: workspaceId } },
        relations: ['workspaceMemberships', 'workspaceMemberships.workspace'],
      });

      for (const user of usersToUpdate) {
        const userOwnedWorkspaces = user.workspaceMembers
          .filter((member) => member.workspace.owner.id === user.id)
          .map((member) => member.workspace);

        if (userOwnedWorkspaces.length > 0) {
          // 유저가 생성한 워크스페이스 중 첫 번째를 기본값으로 설정
          user.defaultWorkspace = userOwnedWorkspaces[0];
        } else {
          // 유저가 생성한 워크스페이스가 없다면 기본값 제거
          user.defaultWorkspace = null;
        }

        await queryRunner.manager.save(user);
      }

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
}
