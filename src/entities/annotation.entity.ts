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
import { User } from './user.entity';

@Entity()
export class Annotation extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('jsonb', { comment: '라벨링 데이터 (bounding box 등)' })
  data: any;

  @ManyToOne(() => DataItem, (dataItem) => dataItem.annotations, {
    onDelete: 'CASCADE',
  })
  dataItem: DataItem;

  @ManyToOne(() => ClassLabel, (classLabel) => classLabel.annotations, {
    onDelete: 'CASCADE',
  })
  classLabel: ClassLabel;

  @ManyToOne(() => User, (user) => user.annotations, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  createdBy: User;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
