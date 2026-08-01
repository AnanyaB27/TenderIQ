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

import { TenderEntity } from '@app/database/entities/tender/tender.entity';

import {
  CreateTenderDto,
  UpdateTenderDto,
} from './dto';
import { TendersService } from './tenders.service';

@ApiTags('Tenders')
@Controller('tenders')
export class TendersController {
  constructor(
    private readonly tendersService: TendersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new tender',
  })
  @ApiResponse({
    status: 201,
    description: 'Tender created successfully.',
    type: TenderEntity,
  })
  create(
    @Body() dto: CreateTenderDto,
  ): Promise<TenderEntity> {
    return this.tendersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all tenders',
  })
  @ApiResponse({
    status: 200,
    description: 'Tenders retrieved successfully.',
    type: [TenderEntity],
  })
  findAll(): Promise<TenderEntity[]> {
    return this.tendersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a tender by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender retrieved successfully.',
    type: TenderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<TenderEntity> {
    return this.tendersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a tender',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender updated successfully.',
    type: TenderEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Tender not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTenderDto,
  ): Promise<TenderEntity> {
    return this.tendersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a tender',
  })
  @ApiParam({
    name: 'id',
    description: 'Tender UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Tender deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Tender not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.tendersService.remove(id);
  }
}