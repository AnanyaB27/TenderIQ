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

import { TenderSourceEntity } from '@app/database/entities/tender/tender-source.entity';

import {
  CreateTenderSourceDto,
  UpdateTenderSourceDto,
} from './dto';
import { SourcesService } from './sources.service';

@ApiTags('Tender Sources')
@Controller('tenders/sources')
export class SourcesController {
  constructor(
    private readonly sourcesService: SourcesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tender source',
  })
  @ApiResponse({
    status: 201,
    description: 'Tender source created successfully.',
    type: TenderSourceEntity,
  })
  create(
    @Body() dto: CreateTenderSourceDto,
  ): Promise<TenderSourceEntity> {
    return this.sourcesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all tender sources',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender sources retrieved successfully.',
    type: [TenderSourceEntity],
  })
  findAll(): Promise<TenderSourceEntity[]> {
    return this.sourcesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a tender source by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender source UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender source retrieved successfully.',
    type: TenderSourceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender source not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TenderSourceEntity> {
    return this.sourcesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a tender source',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender source UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender source updated successfully.',
    type: TenderSourceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender source not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenderSourceDto,
  ): Promise<TenderSourceEntity> {
    return this.sourcesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a tender source',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender source UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender source deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tender source not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.sourcesService.remove(id);
  }
}
