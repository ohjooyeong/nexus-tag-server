import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Annotation, LabelType } from 'src/entities/annotation.entity';
import { DataSource, Repository } from 'typeorm';
import { CreateAnnotationDto } from './create-annotation.dto';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { User } from 'src/entities/user.entity';

@Injectable()
export class AnnotationService {
  constructor(
    @InjectRepository(Annotation)
    private annotationRepository: Repository<Annotation>,
    @InjectRepository(WorkspaceMember)
    private readonly workspaceMemberRepository: Repository<WorkspaceMember>,

    private dataSource: DataSource,
  ) {}

  async getAnnotations(itemId: string) {
    try {
      const annotations = await this.annotationRepository.find({
        where: {
          dataItem: { id: itemId },
        },
        relations: ['classLabel', 'createdBy', 'createdBy.user', 'dataItem'],
        order: {
          zIndex: 'ASC',
          createdAt: 'ASC',
        },
      });

      if (!annotations) {
        return [];
      }

      return annotations.map((annotation) => {
        if (!annotation.classLabel || !annotation.dataItem) {
          console.error('Missing relations:', {
            id: annotation.id,
            hasClassLabel: !!annotation.classLabel,
            hasDataItem: !!annotation.dataItem,
          });
          throw new Error('Required relations are missing');
        }

        return {
          id: annotation.id,
          clientId: annotation.clientId,
          labelType: annotation.labelType,
          classLabelId: annotation.classLabel.id,
          polygon: annotation.polygon,
          mask: annotation.mask,
          bbox: annotation.bbox,
          dataItem: {
            id: annotation.dataItem.id,
          },
          zIndex: annotation.zIndex,
          isDeleted: annotation.isDeleted,
          createdAt: annotation.createdAt.toISOString(),
          updatedAt: annotation.updatedAt.toISOString(),
        };
      });
    } catch (error) {
      console.error('Error fetching annotations:', error);
      throw error;
    }
  }

  async syncAnnotations(
    dataItemId: string,
    workspaceId: string,
    annotations: CreateAnnotationDto[],
    user: User,
  ) {
    const workspaceMember = await this.workspaceMemberRepository.findOne({
      where: { workspace: { id: workspaceId }, user: { id: user.id } },
    });

    if (!workspaceMember) {
      throw new NotFoundException('Workspace member not found');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const annotationRepo = queryRunner.manager.getRepository(Annotation);

      const existingAnnotations = await annotationRepo.find({
        where: { dataItem: { id: dataItemId } },
        relations: ['classLabel', 'createdBy', 'dataItem'],
      });

      const existingAnnotationsMap = new Map(
        existingAnnotations.map((ann) => [ann.id, ann]),
      );

      for (const annotation of annotations) {
        const existing = existingAnnotationsMap.get(annotation.id);

        if (existing) {
          await annotationRepo.save({
            ...existing,
            labelType: annotation.type,
            bbox: annotation.bbox,
            mask: annotation.mask,
            polygon: annotation.polygon,
            zIndex: annotation.zIndex,
            isDeleted: annotation.isDeleted,
            classLabel: { id: annotation.classLabelId },
          });
        } else {
          const newAnnotation = annotationRepo.create({
            id: annotation.id,
            labelType: annotation.type as LabelType, // 프론트엔드에서 'type'으로 보내는 것 처리
            bbox: annotation.bbox,
            mask: annotation.mask,
            polygon: annotation.polygon,
            zIndex: annotation.zIndex || 0,
            clientId: annotation.clientId,
            isDeleted: false,
            dataItem: { id: dataItemId },
            classLabel: { id: annotation.classLabelId },
            createdBy: { id: workspaceMember.id },
          });

          await annotationRepo.save(newAnnotation);
        }
      }

      await queryRunner.commitTransaction();
      return await this.getAnnotations(dataItemId);
    } catch (error) {
      console.error('Error syncing annotations:', error);
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
