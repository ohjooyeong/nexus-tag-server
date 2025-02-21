import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Workspace } from './workspace.entity';
import { User } from 'src/entities/user.entity';
import { Project } from './project.entity';
import { DataItem } from './data-item.entity';
import { Annotation } from './annotation.entity';

export enum Role {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  REVIEWER = 'REVIEWER',
  WORKER = 'WORKER',
  VIEWER = 'VIEWER',
}

@Entity()
export class WorkspaceMember {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.workspaceMembers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  user: User;

  @ManyToOne(() => Workspace, (workspace) => workspace.members, {
    onDelete: 'CASCADE', // DB 레벨에서도 삭제 가능하도록 설정
  })
  @JoinColumn()
  workspace: Workspace;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.WORKER,
  })
  role: Role;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;

  @OneToMany(() => Project, (project) => project.createdBy)
  projects: Project[];

  @OneToMany(() => DataItem, (dataItem) => dataItem.createdBy)
  dataItems: DataItem[];

  @OneToMany(() => Annotation, (annotation) => annotation.createdBy)
  annotations: Annotation[];
}
