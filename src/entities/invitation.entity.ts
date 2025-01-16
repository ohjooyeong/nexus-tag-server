import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

import { Workspace } from './workspace.entity';
import { User } from 'src/entities/user.entity';
import { Role } from './workspace-member.entity';

@Entity()
export class Invitation {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { nullable: true }) // 이미 회원인 경우
  @JoinColumn()
  invitedUser: User;

  @Column({ nullable: true }) // 회원이 아닌 경우 이메일 저장
  email: string;

  @ManyToOne(() => Workspace, (workspace) => workspace.members)
  @JoinColumn()
  workspace: Workspace;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.WORKER,
  })
  role: Role;

  @Column({ default: false })
  accepted: boolean;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
