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
import { Annotation } from './annotation.entity';

export enum ClassType {
  SEMANTIC = 'SEMANTIC',
  OBJECT = 'OBJECT',
}

@Entity()
export class ClassLabel extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ enum: ClassType, default: ClassType.SEMANTIC })
  type: ClassType;

  @Column()
  color: string;

  @ManyToOne(() => Project, (project) => project.classLabels, {
    onDelete: 'CASCADE',
  })
  project: Project;

  @OneToMany(() => Annotation, (annotation) => annotation.classLabel, {
    cascade: true,
    nullable: true,
  })
  annotations?: Annotation[];

  @CreateDateColumn({ comment: '생성일' })
  createdAt: Date;

  @UpdateDateColumn({ comment: '수정일' })
  updatedAt: Date;
}
