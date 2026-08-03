import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { NotificationPreferenceEntity } from '@app/database/entities/notifications/notification-preference.entity';

import {
  CreatePreferenceDto,
  UpdatePreferenceDto,
} from './dto';

@Injectable()
export class PreferencesService {
  constructor(
    @InjectRepository(NotificationPreferenceEntity)
    private readonly preferenceRepository: Repository<NotificationPreferenceEntity>,
  ) {}

  async create(
    dto: CreatePreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    const preference = this.preferenceRepository.create(dto);

    return this.preferenceRepository.save(preference);
  }

  async findAll(): Promise<NotificationPreferenceEntity[]> {
    return this.preferenceRepository.find({
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async findOne(id: string): Promise<NotificationPreferenceEntity> {
    const preference = await this.preferenceRepository.findOneBy({
      id,
    });

    if (!preference) {
      throw new NotFoundException(
        `Notification preference with ID '${id}' was not found.`,
      );
    }

    return preference;
  }

  async update(
    id: string,
    dto: UpdatePreferenceDto,
  ): Promise<NotificationPreferenceEntity> {
    const preference = await this.findOne(id);

    this.preferenceRepository.merge(preference, dto);

    return this.preferenceRepository.save(preference);
  }

  async remove(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    await this.findOne(id);

    await this.preferenceRepository.delete(id);

    return {
      success: true,
      message: 'Notification preference deleted successfully.',
    };
  }
}
