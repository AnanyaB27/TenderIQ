import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PipelineItemEntity } from '@app/database/entities/pipeline/pipeline-item.entity';

import {
  CreatePipelineItemDto,
  UpdatePipelineItemDto,
} from './dto';
import { PipelineItemsService } from './pipeline-items.service';

@ApiTags('Pipeline Items')
@Controller('pipeline-items')
export class PipelineItemsController {
  constructor(
    private readonly pipelineItemsService: PipelineItemsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new pipeline item',
  })
  @ApiResponse({
    status: 201,
    description: 'Pipeline item created successfully.',
    type: PipelineItemEntity,
  })
  create(
    @Body() dto: CreatePipelineItemDto,
  ): Promise<PipelineItemEntity> {
    return this.pipelineItemsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all pipeline items',
  })
  @ApiResponse({
    status: 200,
    description: 'Pipeline items retrieved successfully.',
    type: [PipelineItemEntity],
  })
  findAll(): Promise<PipelineItemEntity[]> {
    return this.pipelineItemsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a pipeline item by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Pipeline item UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Pipeline item retrieved successfully.',
    type: PipelineItemEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Pipeline item not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PipelineItemEntity> {
    return this.pipelineItemsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a pipeline item',
  })
  @ApiParam({
    name: 'id',
    description: 'Pipeline item UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Pipeline item updated successfully.',
    type: PipelineItemEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Pipeline item not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePipelineItemDto,
  ): Promise<PipelineItemEntity> {
    return this.pipelineItemsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a pipeline item',
  })
  @ApiParam({
    name: 'id',
    description: 'Pipeline item UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Pipeline item deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Pipeline item not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.pipelineItemsService.remove(id);
  }
}
