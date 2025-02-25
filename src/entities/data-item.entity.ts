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

export enum Status {
  NEW = 'NEW',
  IN_PROGRESS = 'IN_PROGRESS',
  TO_REVIEW = 'TO_REVIEW',
  DONE = 'DONE',
  SKIPPED = 'SKIPPED',
  COMPLETED = 'COMPLETED',
}

@Entity()
export class DataItem extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  fileUrl: string;

  @Column()
  originalName: string;

  @Column()
  filename: string;

  @Column()
  path: string;

  @Column()
  mimeType: string;

  @Column('bigint')
  size: number;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.NEW,
  })
  status: Status;

  @ManyToOne(() => Dataset, (dataset) => dataset.dataItems, {
    onDelete: 'CASCADE',
  })
  dataset: Dataset;

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
