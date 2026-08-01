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

import { MsmeProfileEntity } from '@app/database/entities/identity/msme-profile.entity';

import {
  CreateMsmeProfileDto,
  UpdateMsmeProfileDto,
} from './dto';
import { MsmeProfileService } from './msme-profile.service';

@ApiTags('MSME Profile')
@Controller('organizations/msme-profile')
export class MsmeProfileController {
  constructor(
    private readonly msmeProfileService: MsmeProfileService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new MSME profile',
  })
  @ApiResponse({
    status: 201,
    description: 'MSME profile created successfully.',
    type: MsmeProfileEntity,
  })
  create(
    @Body() dto: CreateMsmeProfileDto,
  ): Promise<MsmeProfileEntity> {
    return this.msmeProfileService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all MSME profiles',
  })
  @ApiResponse({
    status: 200,
    description: 'MSME profiles retrieved successfully.',
    type: [MsmeProfileEntity],
  })
  findAll(): Promise<MsmeProfileEntity[]> {
    return this.msmeProfileService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an MSME profile by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'MSME profile UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'MSME profile retrieved successfully.',
    type: MsmeProfileEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'MSME profile not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MsmeProfileEntity> {
    return this.msmeProfileService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an MSME profile',
  })
  @ApiParam({
    name: 'id',
    description: 'MSME profile UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'MSME profile updated successfully.',
    type: MsmeProfileEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'MSME profile not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMsmeProfileDto,
  ): Promise<MsmeProfileEntity> {
    return this.msmeProfileService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an MSME profile',
  })
  @ApiParam({
    name: 'id',
    description: 'MSME profile UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'MSME profile deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'MSME profile not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.msmeProfileService.remove(id);
  }
}