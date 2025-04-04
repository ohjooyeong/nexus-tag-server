import {
  BaseEntity,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
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

export type Bbox = [number, number, number, number];
export type Mask = number[];
export type Point = [number, number];
export type Polygon = Point[];

@Entity()
export class Annotation extends BaseEntity {
  @Column({ primary: true })
  id: string;

  @Column({ comment: '클라이언트에서 두번째 id', nullable: true })
  clientId: string;

  @Column({ type: 'enum', enum: LabelType, default: LabelType.BBOX })
  labelType: LabelType;

  @Column('jsonb', { nullable: true })
  bbox: Bbox | null;

  @Column('jsonb', { nullable: true })
  mask: Mask | null;

  @Column('jsonb', { nullable: true })
  polygon: Polygon | null;

  @ManyToOne(() => DataItem, (dataItem) => dataItem.annotations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  dataItem: DataItem;

  @Column({ comment: 'z-index' })
  zIndex: number;

  @ManyToOne(() => ClassLabel, (classLabel) => classLabel.annotations, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  classLabel: ClassLabel;

  @ManyToOne(() => WorkspaceMember, (member) => member.annotations, {
    nullable: true,
  })
  createdBy: WorkspaceMember;

  @Column({ default: false })
  isDeleted: boolean;

  @DeleteDateColumn()
  deletedAt: Date;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
