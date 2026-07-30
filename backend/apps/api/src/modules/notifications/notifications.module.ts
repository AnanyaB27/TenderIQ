import { Module } from '@nestjs/common';

import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { PreferencesController } from './preferences.controller';

@Module({
  controllers: [NotificationsController, PreferencesController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
