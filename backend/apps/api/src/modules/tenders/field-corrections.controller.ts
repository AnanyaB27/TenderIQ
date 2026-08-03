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

import { TenderFieldCorrectionEntity } from '@app/database/entities/tender/tender-field-correction.entity';

import {
  CreateFieldCorrectionDto,
  UpdateFieldCorrectionDto,
} from './dto';
import { FieldCorrectionsService } from './field-corrections.service';

@ApiTags('Tender Field Corrections')
@Controller('tenders/field-corrections')
export class FieldCorrectionsController {
  constructor(
    private readonly fieldCorrectionsService: FieldCorrectionsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Record a new tender field correction',
  })
  @ApiResponse({
    status: 201,
    description: 'Tender field correction created successfully.',
    type: TenderFieldCorrectionEntity,
  })
  create(
    @Body() dto: CreateFieldCorrectionDto,
  ): Promise<TenderFieldCorrectionEntity> {
    return this.fieldCorrectionsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all tender field corrections',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender field corrections retrieved successfully.',
    type: [TenderFieldCorrectionEntity],
  })
  findAll(): Promise<TenderFieldCorrectionEntity[]> {
    return this.fieldCorrectionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a tender field correction by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender field correction UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender field correction retrieved successfully.',
    type: TenderFieldCorrectionEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender field correction not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TenderFieldCorrectionEntity> {
    return this.fieldCorrectionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a tender field correction',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender field correction UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender field correction updated successfully.',
    type: TenderFieldCorrectionEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender field correction not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateFieldCorrectionDto,
  ): Promise<TenderFieldCorrectionEntity> {
    return this.fieldCorrectionsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a tender field correction',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender field correction UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender field correction deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tender field correction not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.fieldCorrectionsService.remove(id);
  }
}
