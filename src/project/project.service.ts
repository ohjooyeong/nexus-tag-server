import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';
import { Workspace } from 'src/entities/workspace.entity';
import { User } from 'src/entities/user.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async createProject(
    createProjectDto: {
      name: string;
      description: string;
      workspaceId: string;
    },
    user: User,
  ) {
    try {
      const { workspaceId, name, description } = createProjectDto;

      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { workspace: { id: workspaceId }, user: { id: user.id } },
      });

      if (!workspaceMember) {
        throw new NotFoundException('Workspace member not found');
      }

      const project = this.projectRepository.create({
        name,
        description,
        workspace,
        createdBy: workspaceMember,
      });

      const resultProject = await this.projectRepository.save(project);

      return resultProject;
    } catch (error) {
      console.error('Unexpected error during create project:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

  async findProjectsByWorkspace(
    workspaceId: string,
    search?: string,
    page = 1,
    limit = 20,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
      relations: ['projects'],
    });

    if (!workspace) {
      throw new Error('Workspace not found');
    }

    const queryBuilder = this.projectRepository
      .createQueryBuilder('project')
      .where('project.workspaceId = :workspaceId', { workspaceId });

    if (search) {
      queryBuilder.andWhere('project.name LIKE :search', {
        search: `%${search}%`,
      });
    }

    const total = await queryBuilder.getCount();
    const projects = await queryBuilder
      .orderBy('project.createdAt', order.toUpperCase() as 'ASC' | 'DESC')
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { projects, total, page, limit };
  }

  async findProjectById(projectId: string) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['workspace', 'createdBy', 'createdBy.user'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      return project;
    } catch (error) {
      console.error('Unexpected error while finding project:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
