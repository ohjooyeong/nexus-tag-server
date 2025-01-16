import { Injectable } from '@nestjs/common';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { Repository } from 'typeorm';
import { Workspace } from '../entities/workspace.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class WorkspaceService {
  constructor(
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  create(createWorkspaceDto: CreateWorkspaceDto) {
    return this.workspaceRepository.save(createWorkspaceDto);
  }

  findAll() {
    return this.workspaceRepository.find();
  }

  findOne(id: string) {
    return this.workspaceRepository.findOneBy({ id });
  }

  async update(id: string, updateWorkspaceDto: UpdateWorkspaceDto) {
    await this.workspaceRepository.update(id, updateWorkspaceDto);
    return this.workspaceRepository.findOneBy({ id });
  }

  async remove(id: string) {
    await this.workspaceRepository.delete(id);
    return id;
  }
}
