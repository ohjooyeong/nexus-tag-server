import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { DatasetService } from './dataset.service';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { User } from 'src/entities/user.entity';

@Controller('/workspaces/:workspaceId/projects/:projectId/datasets')
@UseGuards(JwtAuthGuard)
export class DatasetController {
  constructor(private readonly datasetService: DatasetService) {}

  @Get()
  async getDatasets(
    @Param('projectId') projectId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    const datasets = await this.datasetService.getDatasets(
      projectId,
      workspaceId,
      user,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Dataset list found successfully',
      data: datasets,
    };
  }

  @Get('stats')
  async getDatasetStats(
    @Param('projectId') projectId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
  ) {
    const stats = await this.datasetService.getDatasetStats(
      projectId,
      workspaceId,
      user,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Dataset statistics retrieved successfully',
      data: {
        totalDatasets: stats.datasetCount,
        totalItems: stats.dataItemCount,
      },
    };
  }

  @Get(':datasetId/items')
  async getDatasetItems(
    @Param('projectId') projectId: string,
    @Param('datasetId') datasetId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    const items = await this.datasetService.getDatasetItems(
      projectId,
      datasetId,
      page,
      limit,
      order,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Dataset items retrieved successfully',
      data: items,
    };
  }

  @Get('items')
  async getAllDatasetItems(
    @Param('projectId') projectId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('order') order: 'asc' | 'desc' = 'desc',
  ) {
    const items = await this.datasetService.getAllDatasetItems(
      projectId,
      page,
      limit,
      order,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'All dataset items retrieved successfully',
      data: items,
    };
  }

  @Post()
  async createDataset(
    @Param('projectId') projectId: string,
    @Param('workspaceId') workspaceId: string,
    @CurrentUser() user: User,
    @Body() createDatasetDto: { name: string },
  ) {
    const dataset = await this.datasetService.createDataset(
      projectId,
      workspaceId,
      user,
      createDatasetDto,
    );

    return {
      statusCode: HttpStatus.CREATED,
      message: 'Dataset created successfully',
      data: dataset,
    };
  }

  @Put(':datasetId')
  async updateDataset(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('datasetId') datasetId: string,
    @Body() updateDatasetDto: { name: string },
    @CurrentUser() user: User,
  ) {
    const dataset = await this.datasetService.updateDataset(
      workspaceId,
      projectId,
      datasetId,
      user,
      updateDatasetDto,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Dataset updated successfully',
      data: dataset,
    };
  }

  @Delete(':datasetId')
  async deleteDataset(
    @Param('workspaceId') workspaceId: string,
    @Param('projectId') projectId: string,
    @Param('datasetId') datasetId: string,
    @CurrentUser() user: User,
  ) {
    await this.datasetService.deleteDataset(
      workspaceId,
      projectId,
      datasetId,
      user,
    );

    return {
      statusCode: HttpStatus.OK,
      message: 'Dataset deleted successfully',
      data: null,
    };
  }
}
