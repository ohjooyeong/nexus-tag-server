import { Exclude } from 'class-transformer';
import { Profile } from 'src/profile/entities/profile.entity';
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

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
  birth_date: Date | null;

  @Exclude()
  @Column({ type: 'varchar' })
  password: string;

  @CreateDateColumn({ comment: '생성일' })
  created_at: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updated_at: Date;

  @VersionColumn({ comment: '버전' })
  version: number;

  /**
   * 1 : 1 관계 설정
   * @OneToOne -> 해당 엔티티(User) To 대상 엔티티(Profile)
   *              하나의 유저는 하나의 개인정보를 갖는다.
   */
  @OneToOne(() => Profile, { cascade: true, eager: true })
  @JoinColumn({ name: 'profile' })
  profile: Profile;
}
