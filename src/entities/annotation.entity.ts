import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DataItem } from './data-item.entity';
import { ClassLabel } from './class-label.entity';

import { WorkspaceMember } from './workspace-member.entity';

export enum LabelType {
  BBOX = 'BBOX',
  POLYGON = 'POLYGON',
  MASK = 'MASK',
}

@Entity()
export class Annotation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ comment: '클라이언트에서 생성한 id', nullable: true })
  clientId: string;

  @Column({ type: 'enum', enum: LabelType, default: LabelType.BBOX })
  labelType: LabelType;

  @Column('jsonb', { comment: '라벨링 데이터 (bounding box 등)' })
  data: any;

  @ManyToOne(() => DataItem, (dataItem) => dataItem.annotations, {
    onDelete: 'CASCADE',
  })
  dataItem: DataItem;

  @Column({ comment: 'z-index' })
  zIndex: number;

  @ManyToOne(() => ClassLabel, (classLabel) => classLabel.annotations, {
    onDelete: 'CASCADE',
  })
  classLabel: ClassLabel;

  @ManyToOne(() => WorkspaceMember, (member) => member.annotations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  createdBy: WorkspaceMember;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
