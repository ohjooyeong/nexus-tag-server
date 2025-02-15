import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from 'src/entities/project.entity';
import { Repository } from 'typeorm';
import { Workspace } from 'src/entities/workspace.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async createProject(createProjectDto: CreateProjectDto, user: User) {
    try {
      const { workspaceId, name, description } = createProjectDto;

      const workspace = await this.workspaceRepository.findOne({
        where: { id: workspaceId },
      });

      if (!workspace) {
        throw new NotFoundException('Workspace not found');
      }

      const project = this.projectRepository.create({
        name,
        description,
        workspace,
        createdBy: user,
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
}
