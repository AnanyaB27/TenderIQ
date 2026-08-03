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

import { NotificationPreferenceEntity } from '@app/database/entities/notifications/notification-preference.entity';

import {
  CreatePreferenceDto,
  UpdatePreferenceDto,
} from './dto';
import { PreferencesService } from './preferences.service';

@ApiTags('Notification Preferences')
@Controller('notification-preferences')
export class PreferencesController {
  constructor(
    private readonly preferencesService: PreferencesService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new notification preference',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification preference created successfully.',
    type: NotificationPreferenceEntity,
  })
  create(
    @Body() dto: CreatePreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    return this.preferencesService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all notification preferences',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification preferences retrieved successfully.',
    type: [NotificationPreferenceEntity],
  })
  findAll(): Promise<NotificationPreferenceEntity[]> {
    return this.preferencesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a notification preference by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification preference UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification preference retrieved successfully.',
    type: NotificationPreferenceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification preference not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationPreferenceEntity> {
    return this.preferencesService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a notification preference',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification preference UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification preference updated successfully.',
    type: NotificationPreferenceEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification preference not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdatePreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    return this.preferencesService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a notification preference',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification preference UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification preference deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification preference not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.preferencesService.remove(id);
  }
}
