
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

import { PipelineItemEntity } from '@app/database/entities/pipeline/pipeline-item.entity';
import { JwtAuthGuard } from '../../../../../libs/common/guards/jwt-auth.guard';
import { OrganizationMembershipGuard } from '../../../../../libs/common/guards/organization-membership.guard';

import {
  CreatePipelineItemDto,
  UpdatePipelineItemDto,
} from './dto';
import { PipelineItemsService } from './pipeline-items.service';

@ApiTags('Pipeline Items')
@UseGuards(JwtAuthGuard, OrganizationMembershipGuard)
@Controller('pipeline-items')
export class PipelineItemsController {
  constructor(
    private readonly pipelineItemsService: PipelineItemsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a pipeline item for an organization' })
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
    summary: 'Retrieve pipeline items for an organization',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization pipeline items retrieved successfully.',
    type: [PipelineItemEntity],
  })
  findAll(
    @Query('organizationId') organizationId: string,
  ): Promise<PipelineItemEntity[]> {
    if (!organizationId) {
      throw new BadRequestException(
        'organizationId query parameter is required.',
      );
    }

    return this.pipelineItemsService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an organization pipeline item by ID',
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
    @Query('organizationId') organizationId: string,
  ): Promise<PipelineItemEntity> {
    if (!organizationId) {
      throw new BadRequestException(
        'organizationId query parameter is required.',
      );
    }

    return this.pipelineItemsService.findOne(id, organizationId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a pipeline item within its organization',
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
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId') organizationId: string,
    @Body() dto: UpdatePipelineItemDto,
  ): Promise<PipelineItemEntity> {
    if (!organizationId) {
      throw new BadRequestException(
        'organizationId query parameter is required.',
      );
    }

    return this.pipelineItemsService.update(id, organizationId, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a pipeline item within its organization',
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
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('organizationId') organizationId: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!organizationId) {
      throw new BadRequestException(
        'organizationId query parameter is required.',
      );
    }

    return this.pipelineItemsService.remove(id, organizationId);
  }
}
