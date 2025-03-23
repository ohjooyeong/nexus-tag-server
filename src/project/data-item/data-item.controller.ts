import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { DataItemService } from './data-item.service';

import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('/workspaces/:workspaceId/projects/:projectId/items')
@UseGuards(JwtAuthGuard)
export class DataItemController {
  constructor(private readonly dataItemService: DataItemService) {}

  @Delete('')
  async deleteDataItems(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Body() deleteItemsDto: { itemIds: string[] },
    @CurrentUser() user: User,
  ) {
    const result = await this.dataItemService.deleteDataItem(
      workspaceId,
      projectId,
      deleteItemsDto.itemIds,
      user,
    );

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: { deletedCount: result.deletedCount },
    };
  }

  @Get(':itemId')
  async getDataItem(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: User,
  ) {
    const dataItems = await this.dataItemService.getDataItem(
      workspaceId,
      projectId,
      itemId,
      user,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Data item retrieved successfully',
      data: dataItems,
    };
  }

  @Put(':itemId')
  async updateDataItem(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('itemId') itemId: string,
    @CurrentUser() user: User,
    @Body() updateDataItemDto: { name: string },
  ) {
    const dataItem = await this.dataItemService.updateDataItem(
      workspaceId,
      projectId,
      itemId,
      user,
      updateDataItemDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Data item updated successfully',
      data: dataItem,
    };
  }
}
