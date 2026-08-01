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

import { TenderCategoryEntity } from '@app/database/entities/tender/tender-category.entity';

import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from './dto';
import { CategoriesService } from './categories.service';

@ApiTags('Tender Categories')
@Controller('tenders/categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tender category',
  })
  @ApiResponse({
    status: 201,
    description: 'Tender category created successfully.',
    type: TenderCategoryEntity,
  })
  create(
    @Body() dto: CreateCategoryDto,
  ): Promise<TenderCategoryEntity> {
    return this.categoriesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all tender categories',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender categories retrieved successfully.',
    type: [TenderCategoryEntity],
  })
  findAll(): Promise<TenderCategoryEntity[]> {
    return this.categoriesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a tender category by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender category UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender category retrieved successfully.',
    type: TenderCategoryEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender category not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TenderCategoryEntity> {
    return this.categoriesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a tender category',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender category UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender category updated successfully.',
    type: TenderCategoryEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender category not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<TenderCategoryEntity> {
    return this.categoriesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a tender category',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender category UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender category deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tender category not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.categoriesService.remove(id);
  }
}