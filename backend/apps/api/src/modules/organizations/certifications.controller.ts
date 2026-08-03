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

import { MsmeCertificationEntity } from '@app/database/entities/identity/msme-certification.entity';

import {
  CreateCertificationDto,
  UpdateCertificationDto,
} from './dto';
import { CertificationsService } from './certifications.service';

@ApiTags('Organization Certifications')
@Controller('organizations/certifications')
export class CertificationsController {
  constructor(
    private readonly certificationsService: CertificationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new organization certification',
  })
  @ApiResponse({
    status: 201,
    description: 'Certification created successfully.',
    type: MsmeCertificationEntity,
  })
  create(
    @Body() dto: CreateCertificationDto,
  ): Promise<MsmeCertificationEntity> {
    return this.certificationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all organization certifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Certifications retrieved successfully.',
    type: [MsmeCertificationEntity],
  })
  findAll(): Promise<MsmeCertificationEntity[]> {
    return this.certificationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve an organization certification by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Certification UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Certification retrieved successfully.',
    type: MsmeCertificationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Certification not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<MsmeCertificationEntity> {
    return this.certificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update an organization certification',
  })
  @ApiParam({
    name: 'id',
    description: 'Certification UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Certification updated successfully.',
    type: MsmeCertificationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Certification not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCertificationDto,
  ): Promise<MsmeCertificationEntity> {
    return this.certificationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an organization certification',
  })
  @ApiParam({
    name: 'id',
    description: 'Certification UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Certification deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Certification not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.certificationsService.remove(id);
  }
}
