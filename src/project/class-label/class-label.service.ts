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

  async getClassLabels(workspaceId: string, projectId: string, user: User) {
    try {
      const workspaceMember = await this.workspaceMemberRepository.findOne({
        where: { user: { id: user.id }, workspace: { id: workspaceId } },
      });

      if (!workspaceMember) {
        throw new NotFoundException('Workspace member not found');
      }

      const classLabels = await this.classLabelRepository.find({
        where: {
          project: { id: projectId },
        },
        order: { createdAt: 'ASC' },
      });

      return classLabels;
    } catch (error) {
      console.error('Error getting classLabels:', error);
      throw new Error('Failed to fetch classLabels');
    }
  }

  async createClassLabel(
    workspaceId: string,
    projectId: string,
    user: User,
    createClassLabelDto: {
      name: string;
      description: string;
      type: ClassType;
      color: string;
    },
  ) {
    const { name, description, type, color } = createClassLabelDto;

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

      const newClassLabel = this.classLabelRepository.create({
        name,
        description,
        type,
        color,
        project: { id: projectId },
      });

      const savedClassLabel = await this.classLabelRepository.save(
        newClassLabel,
      );

      return savedClassLabel;
    } catch (error) {
      console.error('Error creating classLabel:', error);
      throw new Error('Failed to create classLabel');
    }
  }

  async updateClassLabel(
    workspaceId: string,
    projectId: string,
    classLabelId: string,
    user: User,
    updateClassLabelDto: {
      name?: string;
      description?: string;
      type?: ClassType;
      color?: string;
    },
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

      const classLabel = await this.classLabelRepository.findOne({
        where: { id: classLabelId, project: { id: projectId } },
      });

      if (!classLabel) {
        throw new NotFoundException('Class label not found');
      }

      Object.assign(classLabel, updateClassLabelDto);

      const updatedClassLabel = await this.classLabelRepository.save(
        classLabel,
      );

      return updatedClassLabel;
    } catch (error) {
      console.error('Error updating classLabel:', error);
      throw new Error('Failed to update classLabel');
    }
  }
}
