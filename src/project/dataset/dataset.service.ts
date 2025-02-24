import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataItem } from 'src/entities/data-item.entity';
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
    @InjectRepository(DataItem)
    private readonly dataItemRepository: Repository<DataItem>,
  ) {}

  async getDatasets(projectId: string, workspaceId: string, user: User) {
    try {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { user: { id: user.id }, workspace: { id: workspaceId } },
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
    } catch (error) {
      console.error('Error getting datasets:', error);
      throw new Error('Failed to fetch datasets');
    }
  }

  async getDatasetStats(projectId: string, workspaceId: string, user: User) {
    try {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { user: { id: user.id }, workspace: { id: workspaceId } },
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
    } catch (error) {
      console.error('Error getting dataset stats:', error);
      throw new Error('Failed to fetch dataset statistics');
    }
  }

  async getDatasetItems(
    projectId: string,
    datasetId: string,
    page: number,
    limit: number,
    order: 'asc' | 'desc' = 'desc',
  ) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('project not found');
      }

      const skip = (page - 1) * limit;

      const queryBuilder = this.datasetRepository
        .createQueryBuilder('dataset')
        .innerJoinAndSelect('dataset.dataItems', 'dataItems')
        .where('dataset.id = :datasetId', { datasetId })
        .andWhere('dataset.project.id = :projectId', { projectId });

      const total = await queryBuilder.getCount();

      const items = await queryBuilder
        .orderBy('dataItems.createdAt', order.toUpperCase() as 'ASC' | 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch dataset items');
    }
  }

  async getAllDatasetItems(
    projectId: string,
    page: number,
    limit: number,
    order: 'asc' | 'desc' = 'desc',
  ) {
    try {
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
      });

      if (!project) {
        throw new Error('project not found');
      }

      const skip = (page - 1) * limit;

      const queryBuilder = this.datasetRepository
        .createQueryBuilder('dataset')
        .innerJoinAndSelect('dataset.dataItems', 'dataItems')
        .where('dataset.project.id = :projectId', { projectId });

      const total = await queryBuilder.getCount();

      const items = await queryBuilder
        .orderBy('dataItems.createdAt', order.toUpperCase() as 'ASC' | 'DESC')
        .skip(skip)
        .take(limit)
        .getMany();

      return {
        items,
        total,
        page,
        limit,
      };
    } catch (error) {
      console.error(error);
      throw new Error('Failed to fetch dataset items');
    }
  }

  async createDataset(
    projectId: string,
    workspaceId: string,
    user: User,
    createDatasetDto,
  ) {
    try {
      const { name } = createDatasetDto;

      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { user: { id: user.id }, workspace: { id: workspaceId } },
      });

      if (!workspaceMember) {
        throw new NotFoundException('Workspace member not found');
      }

      if (!['OWNER', 'MANAGER'].includes(workspaceMember.role)) {
        throw new NotFoundException('Insufficient permissions');
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
    } catch (error) {
      console.error('Error creating dataset:', error);
      throw new Error('Failed to fetch create dataset');
    }
  }

  async updateDataset(
    workspaceId: string,
    projectId: string,
    datasetId: string,
    user: User,
    updateDatasetDto: { name?: string },
  ) {
    try {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { user: { id: user.id }, workspace: { id: workspaceId } },
      });

      if (!workspaceMember) {
        throw new NotFoundException('Workspace member not found');
      }

      if (!['OWNER', 'MANAGER'].includes(workspaceMember.role)) {
        throw new NotFoundException('Insufficient permissions');
      }

      const dataset = await this.datasetRepository.findOne({
        where: { id: datasetId, project: { id: projectId } },
      });

      if (!dataset) {
        throw new NotFoundException('Dataset not found');
      }

      dataset.name = updateDatasetDto.name ?? dataset.name;

      const updatedDataset = await this.datasetRepository.save(dataset);

      return updatedDataset;
    } catch (error) {
      console.error('Error updating dataset:', error);
      throw new Error('Failed to fetch update dataset');
    }
  }

  async deleteDataset(
    workspaceId: string,
    projectId: string,
    datasetId: string,
    user: User,
  ) {
    try {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: {
          user: { id: user.id.trim() },
          workspace: { id: workspaceId.trim() },
        },
      });
      console.log(user, workspaceId, workspaceMember);

      if (!workspaceMember) {
        throw new NotFoundException('Workspace member not found');
      }

      if (!['OWNER', 'MANAGER'].includes(workspaceMember.role)) {
        throw new NotFoundException('Insufficient permissions');
      }

      const dataset = await this.datasetRepository.findOne({
        where: { id: datasetId, project: { id: projectId } },
      });

      if (!dataset) {
        throw new NotFoundException('Dataset not found');
      }

      const data = await this.datasetRepository.remove(dataset);

      return data;
    } catch (error) {
      console.error('Error deleting dataset:', error);
      throw new Error('Failed to fetch delete dataset');
    }
  }
}
