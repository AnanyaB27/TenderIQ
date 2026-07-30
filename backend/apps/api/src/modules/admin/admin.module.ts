import { Module } from '@nestjs/common';

import { IngestionHealthController } from './ingestion-health.controller';
import { AiMetricsController } from './ai-metrics.controller';
import { OrganizationsAdminController } from './organizations-admin.controller';
import { DsrRequestsController } from './dsr-requests.controller';
import { PlatformMetricsController } from './platform-metrics.controller';
import { WebhooksController } from './webhooks.controller';

@Module({
  controllers: [
    IngestionHealthController,
    AiMetricsController,
    OrganizationsAdminController,
    DsrRequestsController,
    PlatformMetricsController,
    WebhooksController,
  ],
})
export class AdminModule {}
