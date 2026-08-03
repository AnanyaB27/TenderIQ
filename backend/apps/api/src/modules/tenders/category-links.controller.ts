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

import { TenderCategoryLinkEntity } from '@app/database/entities/tender/tender-category-link.entity';

import {
  CreateCategoryLinkDto,
  UpdateCategoryLinkDto,
} from './dto';
import { CategoryLinksService } from './category-links.service';

@ApiTags('Tender Category Links')
@Controller('tenders/category-links')
export class CategoryLinksController {
  constructor(
    private readonly categoryLinksService: CategoryLinksService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Assign a category to a tender',
  })
  @ApiResponse({
    status: 201,
    description: 'Tender category link created successfully.',
    type: TenderCategoryLinkEntity,
  })
  create(
    @Body() dto: CreateCategoryLinkDto,
  ): Promise<TenderCategoryLinkEntity> {
    return this.categoryLinksService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all tender category links',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender category links retrieved successfully.',
    type: [TenderCategoryLinkEntity],
  })
  findAll(): Promise<TenderCategoryLinkEntity[]> {
    return this.categoryLinksService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a tender category link by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender category link UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender category link retrieved successfully.',
    type: TenderCategoryLinkEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender category link not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TenderCategoryLinkEntity> {
    return this.categoryLinksService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a tender category link',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender category link UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender category link updated successfully.',
    type: TenderCategoryLinkEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender category link not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCategoryLinkDto,
  ): Promise<TenderCategoryLinkEntity> {
    return this.categoryLinksService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a tender category link',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender category link UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender category link deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tender category link not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.categoryLinksService.remove(id);
  }
}
