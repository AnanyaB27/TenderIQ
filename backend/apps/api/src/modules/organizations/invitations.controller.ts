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

import { OrganizationInvitationEntity } from '@app/database/entities/identity/organization-invitation.entity';

import {
  CreateInvitationDto,
  UpdateInvitationDto,
} from './dto';
import { InvitationsService } from './invitations.service';

@ApiTags('Organization Invitations')
@Controller('organizations/invitations')
export class InvitationsController {
  constructor(
    private readonly invitationsService: InvitationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new organization invitation',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization invitation created successfully.',
    type: OrganizationInvitationEntity,
  })
  create(
    @Body() dto: CreateInvitationDto,
  ): Promise<OrganizationInvitationEntity> {
    return this.invitationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all organization invitations',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization invitations retrieved successfully.',
    type: [OrganizationInvitationEntity],
  })
  findAll(): Promise<OrganizationInvitationEntity[]> {
    return this.invitationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an organization invitation by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization invitation UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization invitation retrieved successfully.',
    type: OrganizationInvitationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization invitation not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationInvitationEntity> {
    return this.invitationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an organization invitation',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization invitation UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization invitation updated successfully.',
    type: OrganizationInvitationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization invitation not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvitationDto,
  ): Promise<OrganizationInvitationEntity> {
    return this.invitationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an organization invitation',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization invitation UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization invitation deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Organization invitation not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.invitationsService.remove(id);
  }
}