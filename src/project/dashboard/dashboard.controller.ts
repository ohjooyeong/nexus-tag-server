import { Controller, Get, Param, UseGuards, HttpStatus } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('/workspaces/:workspaceId/projects/:projectId/dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('/overview')
  async getProjectOverview(@Param('projectId') projectId: string) {
    const overview = await this.dashboardService.getProjectOverview(projectId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Project overview retrieved successfully',
      data: overview,
    };
  }

  @Get('/info')
  async getProjectDetails(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    const info = await this.dashboardService.getProjectDetails(
      workspaceId,
      projectId,
      user,
    );
    return {
      statusCode: HttpStatus.OK,
      message: 'Project details retrieved successfully',
      data: info,
    };
  }
}
