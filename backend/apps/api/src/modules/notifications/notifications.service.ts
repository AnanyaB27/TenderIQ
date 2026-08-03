import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationEntity } from '@app/database/entities/notifications/notification.entity';

import {
  CreateNotificationDto,
  UpdateNotificationDto,
} from './dto';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(NotificationEntity)
    private readonly notificationRepository: Repository<NotificationEntity>,
  ) {}

  async create(
    dto: CreateNotificationDto,
  ): Promise<NotificationEntity> {
    const notification = this.notificationRepository.create(dto);

    return this.notificationRepository.save(notification);
  }

  async findAll(): Promise<NotificationEntity[]> {
    return this.notificationRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<NotificationEntity> {
    const notification = await this.notificationRepository.findOneBy({
      id,
    });

    if (!notification) {
      throw new NotFoundException(
        `Notification with ID '${id}' was not found.`,
      );
    }

    return notification;
  }

  async update(
    id: string,
    dto: UpdateNotificationDto,
  ): Promise<NotificationEntity> {
    const notification = await this.findOne(id);

    this.notificationRepository.merge(notification, dto);

    return this.notificationRepository.save(notification);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.notificationRepository.delete(id);

    return {
      success: true,
      message: 'Notification deleted successfully.',
    };
  }
}
