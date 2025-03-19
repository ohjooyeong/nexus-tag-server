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

      if (!['OWNER', 'MANAGER'].includes(workspaceMember.role)) {
        throw new NotFoundException('Insufficient permissions');
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

  async updateProject(
    projectId: string,
    updateProjectDto: {
      name: string;
      description: string;
    },
    user: User,
  ) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['workspace', 'createdBy', 'createdBy.user'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Check if user is a member of the workspace
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: {
          workspace: { id: project.workspace.id },
          user: { id: user.id },
        },
      });

      if (!workspaceMember) {
        throw new NotFoundException('User is not a member of this workspace');
      }

      if (!['OWNER', 'MANAGER'].includes(workspaceMember.role)) {
        throw new NotFoundException('Insufficient permissions');
      }

      // Update project properties
      if (updateProjectDto.name) {
        project.name = updateProjectDto.name;
      }
      if (updateProjectDto.description) {
        project.description = updateProjectDto.description;
      }

      const updatedProject = await this.projectRepository.save(project);

      return updatedProject;
    } catch (error) {
      console.error('Unexpected error during update project:', error);
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
      .leftJoinAndSelect('project.datasets', 'dataset')
      .leftJoinAndSelect('dataset.dataItems', 'dataItem')
      .where('project.workspaceId = :workspaceId', { workspaceId })
      .loadRelationCountAndMap(
        'project.totalImages',
        'project.datasets.dataItems',
      );

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

    // 각 프로젝트의 이미지 총 수 계산
    const projectsWithImageCount = projects.map((project) => {
      const totalImages =
        project.datasets?.reduce((acc, dataset) => {
          return acc + (dataset.dataItems?.length || 0);
        }, 0) || 0;

      return {
        ...project,
        totalImages,
      };
    });

    return {
      projects: projectsWithImageCount,
      total,
      page,
      limit,
    };
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

  async deleteProject(projectId: string, user: User) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['workspace', 'createdBy', 'createdBy.user'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // Check if user is a member of the workspace
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: {
          workspace: { id: project.workspace.id },
          user: { id: user.id },
        },
      });

      if (!workspaceMember) {
        throw new NotFoundException('User is not a member of this workspace');
      }

      if (!['OWNER', 'MANAGER'].includes(workspaceMember.role)) {
        throw new NotFoundException('Insufficient permissions');
      }

      // Delete the project
      await this.projectRepository.remove(project);

      return { message: 'Project deleted successfully' };
    } catch (error) {
      console.error('Unexpected error during delete project:', error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }
}
