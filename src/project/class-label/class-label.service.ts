import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClassLabel, ClassType } from 'src/entities/class-label.entity';
import { User } from 'src/entities/user.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ClassLabelService {
  constructor(
    @InjectRepository(ClassLabel)
    private readonly classLabelRepository: Repository<ClassLabel>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,
  ) {}

  async getClassLabels(
    workspaceId: string,
    projectId: string,
    itemId: string,
    user: User,
    type: ClassType,
  ) {
    try {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { user: { id: user.id }, workspace: { id: workspaceId } },
      });

      if (!workspaceMember) {
        throw new NotFoundException('Workspace member not found');
      }

      const classLabelsWithCount = await this.classLabelRepository
        .createQueryBuilder('classLabel')
        .leftJoin(
          'annotation',
          'annotation',
          'annotation.classLabelId = classLabel.id AND annotation.dataItemId = :itemId',
          { itemId },
        )
        .where('classLabel.projectId = :projectId', { projectId })
        .andWhere('classLabel.type = :type', { type })
        .select([
          'classLabel.id',
          'classLabel.name',
          'classLabel.color',
          'COUNT(annotation.id) as annotationCount',
        ])
        .groupBy('classLabel.id')
        .orderBy('classLabel.createdAt', 'DESC') // 생성일자 기
        .getRawMany();

      return classLabelsWithCount.map((label) => ({
        id: label.classLabel_id,
        name: label.classLabel_name,
        color: label.classLabel_color,
        type: label.classLabel_type,
        annotationCount: parseInt(label.annotationCount),
      }));
    } catch (error) {
      console.error('Error getting classLabels:', error);
      throw new Error('Failed to fetch classLabels');
    }
  }
}
