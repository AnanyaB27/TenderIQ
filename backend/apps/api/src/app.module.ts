import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@app/database/database.module';

import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';

import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { BillingModule } from './modules/billing/billing.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { TendersModule } from './modules/tenders/tenders.module';
import { SavedSearchesModule } from './modules/saved-searches/saved-searches.module';
import { PipelineModule } from './modules/pipeline/pipeline.module';
import { AiModule } from './modules/ai/ai.module';
import { ReportsModule } from './modules/reports/reports.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuditModule } from './modules/audit/audit.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    BillingModule,
    NotificationsModule,
    TendersModule,
    SavedSearchesModule,
    PipelineModule,
    AiModule,
    ReportsModule,
    AdminModule,
    AuditModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
