import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Dataset } from './dataset.entity';
import { Annotation } from './annotation.entity';
import { User } from './user.entity';
import { WorkspaceMember } from './workspace-member.entity';

@Entity()
export class DataItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fileUrl: string;

  @ManyToOne(() => Dataset, (dataset) => dataset.dataItems, {
    onDelete: 'CASCADE',
  })
  dataset: Dataset;

  @ManyToOne(() => WorkspaceMember, (member) => member.dataItems, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  createdBy: WorkspaceMember;

  @OneToMany(() => Annotation, (annotation) => annotation.dataItem, {
    cascade: true,
    nullable: true,
  })
  annotations?: Annotation[];

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
