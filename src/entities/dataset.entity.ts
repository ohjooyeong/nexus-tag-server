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
import { Project } from './project.entity';
import { DataItem } from './data-item.entity';
import { User } from './user.entity';

@Entity()
export class Dataset extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => Project, (project) => project.datasets, {
    onDelete: 'CASCADE',
  })
  project: Project;

  @OneToMany(() => DataItem, (dataItem) => dataItem.dataset, {
    cascade: true,
    nullable: true,
  })
  dataItems?: DataItem[];

  @ManyToOne(() => User, (user) => user.datasets, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  createdBy: User;

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
