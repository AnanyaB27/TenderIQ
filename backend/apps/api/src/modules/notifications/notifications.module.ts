import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { NotificationEntity } from '@app/database/entities/notifications/notification.entity';
import { NotificationPreferenceEntity } from '@app/database/entities/notifications/notification-preference.entity';

import { NotificationsController } from './notifications.controller';
import { PreferencesController } from './preferences.controller';

import { NotificationsService } from './notifications.service';
import { PreferencesService } from './preferences.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      NotificationEntity,
      NotificationPreferenceEntity,
    ]),
  ],
  controllers: [NotificationsController, PreferencesController],
  providers: [NotificationsService, PreferencesService],
  exports: [NotificationsService, PreferencesService],
})
export class NotificationsModule {}
