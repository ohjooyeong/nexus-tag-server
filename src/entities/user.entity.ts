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
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { EmailVerification } from './email-verification.entity';

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

  /**
   * 1 : 1 관계 설정
   * @OneToOne -> 해당 엔티티(User) To 대상 엔티티(Profile)
   *              하나의 유저는 하나의 개인정보를 갖는다.
   */
  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  @JoinColumn({ name: 'profile' })
  profile: Profile;

  @OneToMany(() => WorkspaceMember, (workspaceMember) => workspaceMember.user)
  workspaceMembers: WorkspaceMember[];

  @OneToMany(() => Workspace, (workspace) => workspace.owner)
  ownedWorkspaces: Workspace[];

  @OneToMany(
    () => EmailVerification,
    (emailVerification) => emailVerification.user,
    { cascade: true },
  )
  emailVerifications: EmailVerification[];
}
