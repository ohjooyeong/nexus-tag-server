import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpStatus,
} from '@nestjs/common';
import { ProjectService } from './project.service';

@Controller('workspaces/:workspaceId/projects')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get()
  async getProjects(
    @Param('workspaceId') workspaceId: string,
    @Query('search') search?: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    const projects = await this.projectService.findProjectsByWorkspace(
      workspaceId,
      search,
      page,
      limit,
      order,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Project list found successfully',
      data: projects,
    };
  }
}
