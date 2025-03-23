import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataItem } from 'src/entities/data-item.entity';
import { Project } from 'src/entities/project.entity';
import { User } from 'src/entities/user.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Repository, In } from 'typeorm';
import * as fs from 'fs';
import { Annotation } from 'src/entities/annotation.entity';
import { AwsS3Service } from 'src/aws/aws-s3.service';

@Injectable()
export class DataItemService {
  constructor(
    @InjectRepository(Project)
    private projectRepository: Repository<Project>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(DataItem)
    private readonly dataItemRepository: Repository<DataItem>,
    @InjectRepository(Annotation)
    private readonly annotationRepository: Repository<Annotation>,
    private readonly awsS3Service: AwsS3Service,
  ) {}

  async getDataItem(
    workspaceId: string,
    projectId: string,
    itemId: string,
    user: User,
  ) {
    try {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { user: { id: user.id }, workspace: { id: workspaceId } },
      });

      if (!workspaceMember) {
        throw new NotFoundException('Workspace member not found');
      }

      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['workspace'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      if (project.workspace.id !== workspaceId) {
        throw new NotFoundException(
          'Project does not belong to this workspace',
        );
      }

      const dataItem = await this.dataItemRepository.findOne({
        where: {
          id: itemId,
        },
        relations: ['dataset', 'dataset.project'],
      });

      if (!dataItem) {
        throw new NotFoundException('Data item not found');
      }

      return dataItem;
    } catch (error) {
      console.error('Error getting data item:', error);
      throw new Error('Failed to get data item');
    }
  }

  async updateDataItem(
    workspaceId: string,
    projectId: string,
    dataItemId: string,
    user: User,
    updateDataItemDto: { name?: string },
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

      const dataItem = await this.dataItemRepository.findOne({
        where: { id: dataItemId },
        relations: ['dataset', 'dataset.project'],
      });

      if (!dataItem) {
        throw new NotFoundException('Data item not found');
      }

      if (dataItem.dataset.project.id !== projectId) {
        throw new NotFoundException(
          'Data item does not belong to this project',
        );
      }

      dataItem.name = updateDataItemDto.name ?? dataItem.name;

      const updatedDataItem = await this.dataItemRepository.save(dataItem);
      return updatedDataItem;
    } catch (error) {
      console.error('Error updating data item:', error);
      throw new Error('Failed to update data item');
    }
  }

  async deleteDataItem(
    workspaceId: string,
    projectId: string,
    dataItemIds: string[],
    user: User,
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

      const dataItems = await this.dataItemRepository.find({
        where: { id: In(dataItemIds) },
        relations: ['dataset', 'dataset.project'],
      });

      if (dataItems.length === 0) {
        throw new NotFoundException('No data items found');
      }

      const invalidItems = dataItems.filter(
        (item) => item.dataset.project.id !== projectId,
      );

      if (invalidItems.length > 0) {
        throw new NotFoundException(
          'Some data items do not belong to this project',
        );
      }

      await Promise.all(
        dataItems.map(async (item) => {
          try {
            await this.awsS3Service.deleteFile(item.path);
          } catch (error) {
            console.error(`Failed to delete S3 file: ${item.path}`, error);
          }
        }),
      );

      await this.dataItemRepository.remove(dataItems);

      return {
        message: `Successfully deleted ${dataItems.length} data items`,
        deletedCount: dataItems.length,
      };
    } catch (error) {
      console.error('Error deleting data items:', error);
      throw new Error('Failed to delete data items');
    }
  }
}
