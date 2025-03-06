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

  @Column({ comment: '데이터 아이템 이름' })
  name: string;

  @Column({ comment: '클라이언트에서 불러오는 파일 url' })
  fileUrl: string;

  @Column({ comment: '원본 파일명' })
  originalName: string;

  @Column({ comment: '실제 저장되는 유니크 파일명' })
  filename: string;

  @Column({ comment: '실제 저장되는 파일 경로' })
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
    nullable: true,
  })
  annotations?: Annotation[];

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
