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

import { OrganizationMemberEntity } from '@app/database/entities/identity/organization-member.entity';

import {
  CreateMemberDto,
  UpdateMemberDto,
} from './dto';
import { MembersService } from './members.service';

@ApiTags('Organization Members')
@Controller('organizations/members')
export class MembersController {
  constructor(
    private readonly membersService: MembersService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new organization member',
  })
  @ApiResponse({
    status: 201,
    description: 'Organization member created successfully.',
    type: OrganizationMemberEntity,
  })
  create(
    @Body() dto: CreateMemberDto,
  ): Promise<OrganizationMemberEntity> {
    return this.membersService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all organization members',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization members retrieved successfully.',
    type: [OrganizationMemberEntity],
  })
  findAll(): Promise<OrganizationMemberEntity[]> {
    return this.membersService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an organization member by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization member UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization member retrieved successfully.',
    type: OrganizationMemberEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization member not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<OrganizationMemberEntity> {
    return this.membersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an organization member',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization member UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization member updated successfully.',
    type: OrganizationMemberEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization member not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateMemberDto,
  ): Promise<OrganizationMemberEntity> {
    return this.membersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an organization member',
  })
  @ApiParam({
    name: 'id',
    description: 'Organization member UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Organization member deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Organization member not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.membersService.remove(id);
  }
}