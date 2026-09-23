import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Put,
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
@Controller('organizations')
export class MsmeProfileController {
  constructor(
    private readonly msmeProfileService: MsmeProfileService,
  ) {}

  // ---------------------------------------------------------
  // Organization-scoped profile API used by TenderIQ frontend
  // ---------------------------------------------------------

  @Get(':organizationId/profile')
  @ApiOperation({
    summary: 'Get MSME profile for an organization',
  })
  @ApiParam({
    name: 'organizationId',
    type: String,
    format: 'uuid',
  })
  async getOrganizationProfile(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
  ): Promise<MsmeProfileEntity | null> {
    return this.msmeProfileService.findByOrganizationId(
      organizationId,
    );
  }

  @Put(':organizationId/profile')
  @ApiOperation({
    summary: 'Create or update MSME profile for an organization',
  })
  @ApiParam({
    name: 'organizationId',
    type: String,
    format: 'uuid',
  })
  async updateOrganizationProfile(
    @Param('organizationId', ParseUUIDPipe) organizationId: string,
    @Body()
    body: {
      turnoverInCrores?: number | null;
      yearsOfExperience?: number | null;
      operatingLocations?: string[] | null;
      coreCapabilities?: string[] | null;
    },
  ): Promise<MsmeProfileEntity> {
    return this.msmeProfileService.createOrUpdateForOrganization(
      organizationId,
      body,
    );
  }

  // ---------------------------------------------------------
  // Existing CRUD API — preserved
  // ---------------------------------------------------------

  @Post('msme-profile')
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

  @Get('msme-profile')
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

  @Get('msme-profile/:id')
  @ApiOperation({
    summary: 'Retrieve an MSME profile by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'MSME profile UUID',
    type: String,
    format: 'uuid',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MsmeProfileEntity> {
    return this.msmeProfileService.findOne(id);
  }

  @Patch('msme-profile/:id')
  @ApiOperation({
    summary: 'Update an MSME profile',
  })
  @ApiParam({
    name: 'id',
    description: 'MSME profile UUID',
    type: String,
    format: 'uuid',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMsmeProfileDto,
  ): Promise<MsmeProfileEntity> {
    return this.msmeProfileService.update(id, dto);
  }

  @Delete('msme-profile/:id')
  @ApiOperation({
    summary: 'Delete an MSME profile',
  })
  @ApiParam({
    name: 'id',
    description: 'MSME profile UUID',
    type: String,
    format: 'uuid',
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