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

import { SavedSearchEntity } from '@app/database/entities/pipeline/saved-search.entity';

import {
  CreateSavedSearchDto,
  UpdateSavedSearchDto,
} from './dto';
import { SavedSearchesService } from './saved-searches.service';

@ApiTags('Saved Searches')
@Controller('saved-searches')
export class SavedSearchesController {
  constructor(
    private readonly savedSearchesService: SavedSearchesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new saved search',
  })
  @ApiResponse({
    status: 201,
    description: 'Saved search created successfully.',
    type: SavedSearchEntity,
  })
  create(
    @Body() dto: CreateSavedSearchDto,
  ): Promise<SavedSearchEntity> {
    return this.savedSearchesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all saved searches',
  })
  @ApiResponse({
    status: 200,
    description: 'Saved searches retrieved successfully.',
    type: [SavedSearchEntity],
  })
  findAll(): Promise<SavedSearchEntity[]> {
    return this.savedSearchesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a saved search by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Saved search UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Saved search retrieved successfully.',
    type: SavedSearchEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Saved search not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<SavedSearchEntity> {
    return this.savedSearchesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a saved search',
  })
  @ApiParam({
    name: 'id',
    description: 'Saved search UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Saved search updated successfully.',
    type: SavedSearchEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Saved search not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateSavedSearchDto,
  ): Promise<SavedSearchEntity> {
    return this.savedSearchesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a saved search',
  })
  @ApiParam({
    name: 'id',
    description: 'Saved search UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Saved search deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Saved search not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.savedSearchesService.remove(id);
  }
}
