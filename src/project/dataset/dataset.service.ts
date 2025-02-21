import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Dataset } from 'src/entities/dataset.entity';
import { Project } from 'src/entities/project.entity';
import { User } from 'src/entities/user.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DatasetService {
  constructor(
    @InjectRepository(Dataset)
    private datasetRepository: Repository<Dataset>,
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async getDatasets(projectId: string, workspaceId: string, user: User) {
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: user.id } },
    });

    if (!workspaceMember) {
      throw new NotFoundException('Workspace member not found');
    }

    const datasets = await this.datasetRepository.find({
      where: {
        project: { id: projectId },
      },
      order: {
        createdAt: 'ASC',
      },
    });

    return datasets;
  }

  async getDatasetStats(projectId: string, workspaceId: string, user: User) {
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: user.id } },
    });

    if (!workspaceMember) {
      throw new NotFoundException('Workspace member not found');
    }

    const stats = await this.datasetRepository
      .createQueryBuilder('dataset')
      .leftJoin('dataset.dataItems', 'dataItems')
      .select([
        'COUNT(DISTINCT dataset.id) as "datasetCount"',
        'COALESCE(COUNT(dataItems.id), 0) as "dataItemCount"',
      ])
      .where('dataset.project.id = :projectId', { projectId })
      .getRawOne();

    return {
      datasetCount: Number(stats?.datasetCount || 0),
      dataItemCount: Number(stats?.dataItemCount || 0),
    };
  }

  async getDatasetItems(
    projectId: string,
    datasetId: string,
    page: number,
    limit: number,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('project not found');
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.datasetRepository
      .createQueryBuilder('dataset')
      .leftJoinAndSelect('dataset.dataItems', 'dataItems')
      .where('dataset.id = :datasetId', { datasetId })
      .andWhere('dataset.projectId = :projectId', { projectId })
      .orderBy('dataItems.createdAt', order.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit };
  }

  async getAllDatasetItems(
    projectId: string,
    page: number,
    limit: number,
    order: 'asc' | 'desc' = 'desc',
  ) {
    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new Error('project not found');
    }

    const skip = (page - 1) * limit;

    const [items, total] = await this.datasetRepository
      .createQueryBuilder('dataset')
      .leftJoinAndSelect('dataset.dataItems', 'dataItems')
      .where('dataset.projectId = :projectId', { projectId })
      .orderBy('dataItems.createdAt', order.toUpperCase() as 'ASC' | 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async createDataset(
    projectId: string,
    workspaceId: string,
    user: User,
    createDatasetDto,
  ) {
    const { name } = createDatasetDto;

    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: user.id } },
    });

    if (!workspaceMember) {
      throw new NotFoundException('Workspace member not found');
    }

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const dataset = this.datasetRepository.create({
      name,
      project,
    });

    const savedDataset = await this.datasetRepository.save(dataset);

    return savedDataset;
  }

  async updateDataset(
    datasetId: string,
    projectId: string,
    workspaceId: string,
    user: User,
    updateData: { name?: string },
  ) {
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: user.id } },
    });

    if (!workspaceMember) {
      throw new NotFoundException('Workspace member not found');
    }

    const dataset = await this.datasetRepository.findOne({
      where: { id: datasetId, project: { id: projectId } },
    });

    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    dataset.name = updateData.name ?? dataset.name;

    const updatedDataset = await this.datasetRepository.save(dataset);

    return updatedDataset;
  }

  async deleteDataset(
    datasetId: string,
    projectId: string,
    workspaceId: string,
    user: User,
  ) {
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: user.id } },
    });

    if (!workspaceMember) {
      throw new NotFoundException('Workspace member not found');
    }

    const dataset = await this.datasetRepository.findOne({
      where: { id: datasetId, project: { id: projectId } },
    });

    if (!dataset) {
      throw new NotFoundException('Dataset not found');
    }

    const data = await this.datasetRepository.remove(dataset);

    return data;
  }
}
