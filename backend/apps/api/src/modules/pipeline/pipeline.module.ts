import { Module } from '@nestjs/common';

import { PipelineItemsController } from './pipeline-items.controller';
import { PipelineItemsService } from './pipeline-items.service';
import { ChecklistTasksController } from './checklist-tasks.controller';
import { ChecklistTasksService } from './checklist-tasks.service';

@Module({
  controllers: [PipelineItemsController, ChecklistTasksController],
  providers: [PipelineItemsService, ChecklistTasksService],
})
export class PipelineModule {}
