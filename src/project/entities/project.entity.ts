import { Workspace } from 'src/workspace/entities/workspace.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Project {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  description: string;

  // @Column()
  // owner: string;

  // @Column()
  // content_type: string;

  // @ManyToOne(() => Workspace, (workspace) => workspace.projects)
  // workspace: Workspace;

  @CreateDateColumn()
  created_at: Date;
}
