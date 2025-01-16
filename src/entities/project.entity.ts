import { Workspace } from 'src/entities/workspace.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum CONTENT_TYPE {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
}

@Entity()
export class Project extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

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

  @ManyToOne(() => Workspace, (workspace) => workspace.projects)
  workspace: Workspace;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
