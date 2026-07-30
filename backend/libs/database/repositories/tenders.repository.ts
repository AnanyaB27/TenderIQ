import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { TenderEntity } from '../entities/tender/tender.entity';
import { TenantScopedRepository } from './tenant-scoped.repository';

@Injectable()
export class TendersRepository extends TenantScopedRepository<TenderEntity> {
  constructor(dataSource: DataSource) {
    super(TenderEntity, dataSource.createEntityManager());
  }
}
