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
import { Role } from 'src/entities/workspace-member.entity';

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

  @Get(':workspaceId/members')
  async getWorkspaceMembers(@Param('workspaceId') workspaceId: string) {
    const data = await this.workspaceService.getWorkspaceMembers(workspaceId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Workspace members found successfully',
      data: data,
    };
  }

  @Put(':workspaceId/members')
  async updateWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Body() updateMemberDto: { email: string; role: Role },
    @CurrentUser() user,
  ) {
    console.log(updateMemberDto);
    const data = await this.workspaceService.updateWorkspaceMember(
      workspaceId,
      updateMemberDto.email,
      updateMemberDto.role,
      user,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Workspace member updated successfully',
      data: data,
    };
  }

  @Post(':workspaceId/members')
  async addWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Body() addMemberDto: { email: string; role: Role },
    @CurrentUser() user,
  ) {
    const data = await this.workspaceService.addWorkspaceMember(
      workspaceId,
      addMemberDto.email,
      addMemberDto.role,
      user,
    );
    return {
      statusCode: HttpStatus.CREATED,
      message: 'Workspace member added successfully',
      data: data,
    };
  }

  @Delete(':workspaceId/members/')
  async removeWorkspaceMember(
    @Param('workspaceId') workspaceId: string,
    @Body() removeMemberDto: { email: string },
    @CurrentUser() user,
  ) {
    const data = await this.workspaceService.removeWorkspaceMember(
      workspaceId,
      removeMemberDto.email,
      user,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Workspace member removed successfully',
      data: data,
    };
  }

  @Get(':workspaceId/my-role')
  async getMyWorkspaceRole(
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    const data = await this.workspaceService.getWorkspaceMemberRole(
      workspaceId,
      user.id,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Workspace role found successfully',
      data: data,
    };
  }
}
