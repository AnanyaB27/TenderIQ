import { Module } from '@nestjs/common';

import { NewMatchProcessor } from './processors/new-match.processor';
import { DeadlineReminderProcessor } from './processors/deadline-reminder.processor';
import { ChecklistOverdueProcessor } from './processors/checklist-overdue.processor';
import { TeammateActionProcessor } from './processors/teammate-action.processor';
import { EmailChannelService } from './channels/email-channel.service';
import { InAppChannelService } from './channels/in-app-channel.service';

@Module({
  providers: [
    NewMatchProcessor,
    DeadlineReminderProcessor,
    ChecklistOverdueProcessor,
    TeammateActionProcessor,
    EmailChannelService,
    InAppChannelService,
  ],
})
export class WorkerModule {}
