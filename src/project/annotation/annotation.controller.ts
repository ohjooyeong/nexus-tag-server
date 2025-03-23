import {
  Controller,
  UseGuards,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpStatus,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';

import { AnnotationService } from './annotation.service';
import { CreateAnnotationDto } from './create-annotation.dto';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('/workspaces/:workspaceId/projects/:projectId/items/:itemId/labels')
@UseGuards(JwtAuthGuard)
export class AnnotationController {
  constructor(private readonly annotationService: AnnotationService) {}

  @Get('')
  async getAnnotations(@Param('itemId') itemId: string) {
    const annotations = await this.annotationService.getAnnotations(itemId);
    return {
      statusCode: HttpStatus.OK,
      message: 'Annotations retrieved successfully',
      data: annotations,
    };
  }

  @Post('sync')
  async syncAnnotations(
    @Body() annotations: CreateAnnotationDto[],
    @Param('workspaceId') workspaceId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: User,
  ) {
    const result = await this.annotationService.syncAnnotations(
      itemId,
      workspaceId,
      annotations,
      user,
    );
    console.log(result);

    return {
      statusCode: HttpStatus.OK,
      message: 'Annotations synced successfully',
      data: result,
    };
  }
}
