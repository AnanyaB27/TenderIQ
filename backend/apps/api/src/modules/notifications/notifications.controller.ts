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

import { NotificationEntity } from '@app/database/entities/notifications/notification.entity';

import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './dto';
import { NotificationsService } from './notifications.service';

@ApiTags('Notifications')
@Controller('notifications')
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
  ) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new notification',
  })
  @ApiResponse({
    status: 201,
    description: 'Notification created successfully.',
    type: NotificationEntity,
  })
  create(
    @Body() dto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    return this.notificationsService.create(dto);
  }

  @Get()
  @ApiOperation({
    summary: 'Retrieve all notifications',
  })
  @ApiResponse({
    status: 200,
    description: 'Notifications retrieved successfully.',
    type: [NotificationEntity],
  })
  findAll(): Promise<NotificationEntity[]> {
    return this.notificationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Retrieve a notification by ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification retrieved successfully.',
    type: NotificationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
  })
  findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<NotificationEntity> {
    return this.notificationsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a notification',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification updated successfully.',
    type: NotificationEntity,
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
  })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    return this.notificationsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a notification',
  })
  @ApiParam({
    name: 'id',
    description: 'Notification UUID',
    type: String,
    format: 'uuid',
  })
  @ApiResponse({
    status: 200,
    description: 'Notification deleted successfully.',
  })
  @ApiResponse({
    status: 404,
    description: 'Notification not found.',
  })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    return this.notificationsService.remove(id);
  }
}
