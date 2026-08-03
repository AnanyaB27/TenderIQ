import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { PipelineItemEntity } from '@app/database/entities/pipeline/pipeline-item.entity';
import { ChecklistTaskEntity } from '@app/database/entities/pipeline/checklist-task.entity';
import { BidDraftEntity } from '@app/database/entities/pipeline/bid-draft.entity';

import { PipelineItemsController } from './pipeline-items.controller';
import { ChecklistTasksController } from './checklist-tasks.controller';
import { BidDraftsController } from './bid-drafts.controller';

import { PipelineItemsService } from './pipeline-items.service';
import { ChecklistTasksService } from './checklist-tasks.service';
import { BidDraftsService } from './bid-drafts.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PipelineItemEntity,
      ChecklistTaskEntity,
      BidDraftEntity,
    ]),
  ],
  controllers: [
    PipelineItemsController,
    ChecklistTasksController,
    BidDraftsController,
  ],
  providers: [
    PipelineItemsService,
    ChecklistTasksService,
    BidDraftsService,
  ],
  exports: [
    PipelineItemsService,
    ChecklistTasksService,
    BidDraftsService,
  ],
})
export class PipelineModule {}
