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

import { DsrRequestEntity } from '@app/database/entities/billing/dsr-request.entity';

import {
  CreateDsrRequestDto,
  UpdateDsrRequestDto,
} from './dto';
import { DsrRequestsService } from './dsr-requests.service';

@ApiTags('Admin - DSR Requests')
@Controller('admin/dsr-requests')
export class DsrRequestsController {
  constructor(
    private readonly dsrRequestsService: DsrRequestsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new data subject request',
  })
  @ApiResponse({
    status: 201,
    description: 'Data subject request created successfully.',
    type: DsrRequestEntity,
  })
  create(
    @Body() dto: CreateDsrRequestDto,
  ): Promise<DsrRequestEntity> {
    return this.dsrRequestsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all data subject requests',
  })
  @ApiResponse({
    status: 200,
    description: 'Data subject requests retrieved successfully.',
    type: [DsrRequestEntity],
  })
  findAll(): Promise<DsrRequestEntity[]> {
    return this.dsrRequestsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a data subject request by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Data subject request UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Data subject request retrieved successfully.',
    type: DsrRequestEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Data subject request not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<DsrRequestEntity> {
    return this.dsrRequestsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a data subject request',
  })
  @ApiParam({
    name: 'id',
    description: 'Data subject request UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Data subject request updated successfully.',
    type: DsrRequestEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Data subject request not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDsrRequestDto,
  ): Promise<DsrRequestEntity> {
    return this.dsrRequestsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a data subject request',
  })
  @ApiParam({
    name: 'id',
    description: 'Data subject request UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Data subject request deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Data subject request not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.dsrRequestsService.remove(id);
  }
}
