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

import { TenderDocumentEntity } from '@app/database/entities/tender/tender-document.entity';

import {
  CreateTenderDocumentDto,
  UpdateTenderDocumentDto,
} from './dto';
import { DocumentsService } from './documents.service';

@ApiTags('Tender Documents')
@Controller('tenders/documents')
export class DocumentsController {
  constructor(
    private readonly documentsService: DocumentsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tender document',
  })
  @ApiResponse({
    status: 201,
    description: 'Tender document created successfully.',
    type: TenderDocumentEntity,
  })
  create(
    @Body() dto: CreateTenderDocumentDto,
  ): Promise<TenderDocumentEntity> {
    return this.documentsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all tender documents',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender documents retrieved successfully.',
    type: [TenderDocumentEntity],
  })
  findAll(): Promise<TenderDocumentEntity[]> {
    return this.documentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a tender document by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender document UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender document retrieved successfully.',
    type: TenderDocumentEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender document not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TenderDocumentEntity> {
    return this.documentsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a tender document',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender document UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender document updated successfully.',
    type: TenderDocumentEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender document not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenderDocumentDto,
  ): Promise<TenderDocumentEntity> {
    return this.documentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a tender document',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender document UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender document deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tender document not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.documentsService.remove(id);
  }
}
