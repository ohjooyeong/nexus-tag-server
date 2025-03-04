import {
  Controller,
  Get,
  HttpStatus,
  Param,
  Query,
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

  @Get(':itemId')
  async getClassLabels(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @Query('type') type: ClassType = ClassType.OBJECT,
    @CurrentUser() user: User,
  ) {
    const classLabel = await this.classLabelService.getClassLabels(
      workspaceId,
      projectId,
      itemId,
      user,
      type,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'class label list found successfully',
      data: classLabel,
    };
  }
}
