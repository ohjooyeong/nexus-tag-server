import { User } from 'src/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
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

  @Column({ type: 'varchar', comment: '유저 이미지', default: null })
  profileImg: string | null;

  @Column({
    type: 'enum',
    enum: STATUS,
    default: STATUS.ACTIVE,
    comment: '계정 상태(ACTIVE, PAUSE)',
  })
  status: string;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;

  @OneToOne(() => User, (user) => user.profile)
  user: User;
}
