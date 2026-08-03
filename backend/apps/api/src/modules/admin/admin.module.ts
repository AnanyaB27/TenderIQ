import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DsrRequestEntity } from '@app/database/entities/billing/dsr-request.entity';

import { IngestionHealthController } from './ingestion-health.controller';
import { AiMetricsController } from './ai-metrics.controller';
import { OrganizationsAdminController } from './organizations-admin.controller';
import { DsrRequestsController } from './dsr-requests.controller';
import { PlatformMetricsController } from './platform-metrics.controller';
import { WebhooksController } from './webhooks.controller';

import { DsrRequestsService } from './dsr-requests.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([DsrRequestEntity]),
  ],
  controllers: [
    IngestionHealthController,
    AiMetricsController,
    OrganizationsAdminController,
    DsrRequestsController,
    PlatformMetricsController,
    WebhooksController,
  ],
  providers: [DsrRequestsService],
  exports: [DsrRequestsService],
})
export class AdminModule {}
