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
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { User } from 'src/entities/user.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

@Controller('/projects')
@UseGuards(JwtAuthGuard)
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async createProject(
    @CurrentUser() user: User,
    @Body() createProjectDto: CreateProjectDto,
  ) {
    const project = await this.projectService.createProject(
      createProjectDto,
      user,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Project created successfully',
      data: project,
    };
  }

  @Get()
  async getProjects(
    @Query('workspaceId') workspaceId: string,
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
