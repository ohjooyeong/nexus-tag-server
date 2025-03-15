import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataItem, Status } from 'src/entities/data-item.entity';
import { Repository } from 'typeorm';
import { Project } from 'src/entities/project.entity';
import { Workspace } from 'src/entities/workspace.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Dataset } from 'src/entities/dataset.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(DataItem)
    private readonly dataItemRepository: Repository<DataItem>,
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
    @InjectRepository(Dataset)
    private readonly datasetRepository: Repository<Dataset>,
  ) {}

  async getProjectOverview(projectId: string) {
    try {
      // Join을 통해 project까지 연결
      const queryBuilder = this.dataItemRepository
        .createQueryBuilder('dataItem')
        .innerJoin('dataItem.dataset', 'dataset')
        .innerJoin('dataset.project', 'project')
        .where('project.id = :projectId', { projectId });

      const totalCount = await queryBuilder.getCount();

      const statusCounts = await this.dataItemRepository
        .createQueryBuilder('dataItem')
        .innerJoin('dataItem.dataset', 'dataset')
        .innerJoin('dataset.project', 'project')
        .select('dataItem.status', 'status')
        .addSelect('COUNT(*)', 'count')
        .where('project.id = :projectId', { projectId })
        .groupBy('dataItem.status')
        .getRawMany();

      const counts = {
        total: totalCount,
        new: 0,
        inProgress: 0,
        toReview: 0,
        done: 0,
        completed: 0,
        skipped: 0,
      };

      statusCounts.forEach((item) => {
        switch (item.status) {
          case Status.NEW:
            counts.new = parseInt(item.count);
            break;
          case Status.IN_PROGRESS:
            counts.inProgress = parseInt(item.count);
            break;
          case Status.TO_REVIEW:
            counts.toReview = parseInt(item.count);
            break;
          case Status.DONE:
            counts.done = parseInt(item.count);
            break;
          case Status.SKIPPED:
            counts.skipped = parseInt(item.count);
            break;
          case Status.COMPLETED:
            counts.completed = parseInt(item.count);
            break;
        }
      });

      return counts;
    } catch (error) {
      console.error('Error getting data item stats:', error);
      throw new Error('Failed to fetch data item statistics');
    }
  }

  async getProjectDetails(workspaceId: string, projectId: string, user: User) {
    try {
      // 워크스페이스 멤버 확인 및 역할 가져오기
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: {
          user: { id: user.id },
          workspace: { id: workspaceId },
        },
        relations: ['workspace'],
      });

      if (!workspaceMember) {
        throw new NotFoundException('Workspace member not found');
      }

      // 프로젝트 정보 가져오기
      const project = await this.projectRepository.findOne({
        where: { id: projectId },
        relations: ['workspace'],
      });

      if (!project) {
        throw new NotFoundException('Project not found');
      }

      // 데이터셋 수 계산
      const datasetsCount = await this.datasetRepository.count({
        where: { project: { id: projectId } },
      });

      // 데이터 아이템 수 계산
      const dataItemsCount = await this.dataItemRepository
        .createQueryBuilder('dataItem')
        .innerJoin('dataItem.dataset', 'dataset')
        .innerJoin('dataset.project', 'project')
        .where('project.id = :projectId', { projectId })
        .getCount();

      // 워크스페이스 멤버 수 계산
      const membersCount = await this.workspaceMemberRepository.count({
        where: { workspace: { id: workspaceId } },
      });

      return {
        workspaceName: workspaceMember.workspace.name,
        datasetsCount,
        dataItemsCount,
        membersCount,
        myRole: workspaceMember.role,
        createdAt: project.createdAt,
      };
    } catch (error) {
      console.error('Error getting project details:', error);
      throw new Error('Failed to fetch project details');
    }
  }
}
