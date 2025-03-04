import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { ClassLabelService } from './class-label.service';
import { User } from 'src/entities/user.entity';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { ClassType } from 'src/entities/class-label.entity';

@Controller('/workspaces/:workspaceId/projects/:projectId/labels')
@UseGuards(JwtAuthGuard)
export class ClassLabelController {
  constructor(private readonly classLabelService: ClassLabelService) {}

  @Get('')
  async getClassLabels(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
  ) {
    const classLabels = await this.classLabelService.getClassLabels(
      workspaceId,
      projectId,
      user,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'class label list found successfully',
      data: classLabels,
    };
  }

  @Post('')
  async createClassLabel(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @CurrentUser() user: User,
    @Body()
    createClassLabelDto: {
      type: ClassType;
      name: string;
      description: string;
      color: string;
    },
  ) {
    const classLabel = await this.classLabelService.createClassLabel(
      workspaceId,
      projectId,
      user,
      createClassLabelDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'class label created successfully',
      data: classLabel,
    };
  }
}
