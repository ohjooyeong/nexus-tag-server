import { Project } from 'src/entities/project.entity';
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
import { WorkspaceMember } from './workspace-member.entity';
import { User } from 'src/entities/user.entity';

export enum Plan {
  FREE = 'FREE',
  ADVANCED = 'ADVANCED',
  ENTERPRISE = 'ENTERPRISE',
}

@Entity()
export class Workspace extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: Plan,
    default: Plan.FREE,
    comment: '워크스페이스 지불 플랜',
  })
  plan: Plan;

  @ManyToOne(() => User, (user) => user.ownedWorkspaces, { nullable: false })
  owner: User;

  @OneToMany(
    () => WorkspaceMember,
    (workspaceMember) => workspaceMember.workspace,
    { cascade: true },
  )
  members: WorkspaceMember[];

  // Project와 엔티티 사이의 관계 설정
  @OneToMany(() => Project, (project) => project.workspace, {
    cascade: true,
    nullable: true,
  })
  projects: Project[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
