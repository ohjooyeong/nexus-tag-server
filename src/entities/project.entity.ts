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
import { Workspace } from 'src/entities/workspace.entity';
import { Dataset } from './dataset.entity';
import { ClassLabel } from './class-label.entity';
import { User } from './user.entity';

export enum CONTENT_TYPE {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity()
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column({
    type: 'enum',
    enum: CONTENT_TYPE,
    default: CONTENT_TYPE.IMAGE,
    comment: '컨텐츠 타입',
  })
  content_type: CONTENT_TYPE;

  @ManyToOne(() => Workspace, (workspace) => workspace.projects, {
    onDelete: 'CASCADE',
  })
  workspace: Workspace;

  @OneToMany(() => Dataset, (dataset) => dataset.project, {
    cascade: true,
    nullable: true,
  })
  datasets?: Dataset[];

  @OneToMany(() => ClassLabel, (classLabel) => classLabel.project, {
    cascade: true,
    nullable: true,
  })
  classLabels?: ClassLabel[];

  @ManyToOne(() => User, (user) => user.projects, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  createdBy: User;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
