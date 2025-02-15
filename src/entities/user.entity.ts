import { Exclude } from 'class-transformer';
import { Profile } from 'src/entities/profile.entity';
import { WorkspaceMember } from 'src/entities/workspace-member.entity';
import { Workspace } from 'src/entities/workspace.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmailVerification } from './email-verification.entity';
import { Project } from './project.entity';
import { Dataset } from './dataset.entity';
import { DataItem } from './data-item.entity';
import { Annotation } from './annotation.entity';

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  //length 설정하지 않으면 기본 255 길이 설정
  @Column({ unique: true, comment: '유저 이메일' })
  email: string;

  @Column({ type: 'varchar', comment: '유저 이름' })
  username: string;

  @Column({ type: 'date', comment: '유저 생일', nullable: true })
  birthdate: Date | null;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn({ name: 'profile' })
  profile: Profile;

  @OneToMany(() => WorkspaceMember, (workspaceMember) => workspaceMember.user, {
    cascade: true,
  })
  workspaceMembers: WorkspaceMember[];

  @OneToMany(() => Workspace, (workspace) => workspace.owner, {
    cascade: true,
  })
  ownedWorkspaces: Workspace[];

  @OneToMany(
    () => EmailVerification,
    (emailVerification) => emailVerification.user,
    { cascade: true },
  )
  emailVerifications: EmailVerification[];

  @ManyToOne(() => Workspace, { nullable: true, eager: true })
  defaultWorkspace: Workspace;

  @OneToMany(() => Project, (project) => project.createdBy)
  projects: Project[];

  @OneToMany(() => Dataset, (dataset) => dataset.createdBy)
  datasets: Dataset[];

  @OneToMany(() => DataItem, (dataItem) => dataItem.createdBy)
  dataItems: DataItem[];

  @OneToMany(() => Annotation, (annotation) => annotation.createdBy)
  annotations: Annotation[];
}
