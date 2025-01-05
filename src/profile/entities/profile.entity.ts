import { Exclude } from 'class-transformer';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

//Enum 설정
enum STATUS {
  PAUSE = 'PAUSE',
  ACTIVE = 'ACTIVE',
}

@Entity({ name: 'profile' })
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 50,
    comment: '유저 권한(Ex: 관리자, 일반 유저 등등)',
  })
  role: string;

  @Column({
    type: 'enum',
    enum: STATUS,
    default: STATUS.ACTIVE,
    comment: '계정 상태(ACTIVE, PAUSE)',
  })
  status: string;

  @CreateDateColumn({ comment: '생성일' })
  created_at: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updated_at: Date;

  @VersionColumn({ comment: '버전' })
  version: number;
}
