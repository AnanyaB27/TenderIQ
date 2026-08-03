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

import { UsageCounterEntity } from '@app/database/entities/billing/usage-counter.entity';

import {
  CreateUsageCounterDto,
  UpdateUsageCounterDto,
} from './dto';
import { UsageService } from './usage.service';

@ApiTags('Usage Counters')
@Controller('usage-counters')
export class UsageController {
  constructor(
    private readonly usageService: UsageService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new usage counter',
  })
  @ApiResponse({
    status: 201,
    description: 'Usage counter created successfully.',
    type: UsageCounterEntity,
  })
  create(
    @Body() dto: CreateUsageCounterDto,
  ): Promise<UsageCounterEntity> {
    return this.usageService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all usage counters',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage counters retrieved successfully.',
    type: [UsageCounterEntity],
  })
  findAll(): Promise<UsageCounterEntity[]> {
    return this.usageService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a usage counter by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Usage counter UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage counter retrieved successfully.',
    type: UsageCounterEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Usage counter not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UsageCounterEntity> {
    return this.usageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a usage counter',
  })
  @ApiParam({
    name: 'id',
    description: 'Usage counter UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage counter updated successfully.',
    type: UsageCounterEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Usage counter not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUsageCounterDto,
  ): Promise<UsageCounterEntity> {
    return this.usageService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a usage counter',
  })
  @ApiParam({
    name: 'id',
    description: 'Usage counter UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Usage counter deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Usage counter not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.usageService.remove(id);
  }
}
