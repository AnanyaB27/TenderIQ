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

import { OrganizationEntity } from '../../../../../libs/database/entities/identity/organization.entity';

import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from './dto';
import { OrganizationsService } from './organizations.service';

@ApiTags('Organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(
    private readonly organizationsService: OrganizationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new organization',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization created successfully.',
    type: OrganizationEntity,
  })
  create(
    @Body() dto: CreateOrganizationDto,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all organizations',
  })
  @ApiResponse({
    status: 200,
    description: 'Organizations retrieved successfully.',
    type: [OrganizationEntity],
  })
  findAll(): Promise<OrganizationEntity[]> {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an organization by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization retrieved successfully.',
    type: OrganizationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an organization',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization updated successfully.',
    type: OrganizationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateOrganizationDto,
  ): Promise<OrganizationEntity> {
    return this.organizationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an organization',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.organizationsService.remove(id);
  }
}