import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { WorkspaceService } from './workspace.service';

import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('workspace')
@UseGuards(JwtAuthGuard)
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceService) {}

  @Post('set-default-workspace')
  async setDefaultWorkspace(
    @CurrentUser() user: User,
    @Body() workspaceId: string,
  ) {
    const data = this.workspaceService.setDefaultWorkspace(workspaceId, user);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Default workspace updated successfully',
      data: { workspaceId: data },
    };
  }

  @Get('workspaces')
  async getWorkspaces(@CurrentUser() user: User) {
    const workspaces = await this.workspaceService.getWorkspaces(user);

    return {
      statusCode: HttpStatus.OK,
      message: 'Default workspace found successfully',
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
    const data = this.workspaceService.getWorkspaceById(workspaceId, user.id);
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Current workspace found successfully',
      data: data,
    };
  }

  @Delete(':workspaceId')
  async deleteWorkspace(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    await this.workspaceService.deleteWorkspace(workspaceId, user);

    return {
      statusCode: HttpStatus.OK,
      message: 'Workspace deletedsuccessfully',
      data: null,
    };
  }
}
