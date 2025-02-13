import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
  Put,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';

import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/entities/user.entity';
import { UpdateWorkspaceDto } from './dto/update-workspace.dto';
import { CreateWorkspaceDto } from './dto/create-workspace.dto';

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('set-default-workspace')
  async setDefaultWorkspace(
    @CurrentUser() user: User,
    @Body() workspaceId: string,
  ) {
    const data = await this.workspaceService.setDefaultWorkspace(
      workspaceId,
      user,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Default workspace updated successfully',
      data: { workspaceId: data },
    };
  }

  @Post('')
  async createWorkspace(
    @CurrentUser() user: User,
    @Body() workspaceDto: CreateWorkspaceDto,
  ) {
    const data = await this.workspaceService.createWorkspace(
      workspaceDto.name,
      user,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Workspace created successfully',
      data: data,
    };
  }

  @Get('')
  async getWorkspaces(@CurrentUser() user: User) {
    const workspaces = await this.workspaceService.getWorkspaces(user);

    return {
      statusCode: HttpStatus.OK,
      message: 'Workspace list found successfully',
      data: workspaces,
    };
  }

  @Get('default-workspace')
  async getDefaultWorkspace(@CurrentUser() user: User) {
    const data = await this.workspaceService.getDefaultWorkspace(user);
    return {
      statusCode: HttpStatus.OK,
      message: 'Default workspace found successfully',
      data: data,
    };
  }

  @Get(':workspaceId')
  async getWorkspaceById(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.workspaceService.getWorkspaceById(
      workspaceId,
      user.id,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Current workspace found successfully',
      data: data,
    };
  }

  @Put(':workspaceId')
  async updateWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user,
    @Body() updateWorkspaceDto: UpdateWorkspaceDto,
  ) {
    const data = await this.workspaceService.updateWorkspace(
      workspaceId,
      user.id,
      updateWorkspaceDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Workspace updated successfully',
      data: data,
    };
  }

  @Delete(':workspaceId')
  async deleteWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    await this.workspaceService.deleteWorkspace(workspaceId, user.id);

    return {
      statusCode: HttpStatus.OK,
      message: 'Workspace deleted successfully',
      data: null,
    };
  }
}
