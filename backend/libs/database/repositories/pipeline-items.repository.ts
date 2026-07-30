import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { PipelineItemEntity } from '../entities/pipeline/pipeline-item.entity';
import { TenantScopedRepository } from './tenant-scoped.repository';

@Injectable()
export class PipelineItemsRepository extends TenantScopedRepository<PipelineItemEntity> {
  constructor(dataSource: DataSource) {
    super(PipelineItemEntity, dataSource.createEntityManager());
  }
}
