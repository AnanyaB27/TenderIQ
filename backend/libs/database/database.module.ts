import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserEntity } from './entities/identity/user.entity';
import { UserOauthIdentityEntity } from './entities/identity/user-oauth-identity.entity';
import { OrganizationEntity } from './entities/identity/organization.entity';
import { OrganizationMemberEntity } from './entities/identity/organization-member.entity';
import { OrganizationInvitationEntity } from './entities/identity/organization-invitation.entity';
import { MsmeProfileEntity } from './entities/identity/msme-profile.entity';
import { MsmeCertificationEntity } from './entities/identity/msme-certification.entity';

import { TenderSourceEntity } from './entities/tender/tender-source.entity';
import { TenderCategoryEntity } from './entities/tender/tender-category.entity';
import { TenderEntity } from './entities/tender/tender.entity';
import { TenderCategoryLinkEntity } from './entities/tender/tender-category-link.entity';
import { TenderDocumentEntity } from './entities/tender/tender-document.entity';
import { TenderFieldCorrectionEntity } from './entities/tender/tender-field-correction.entity';
import { IngestionRunEntity } from './entities/tender/ingestion-run.entity';
import { IngestionErrorEntity } from './entities/tender/ingestion-error.entity';

import { TenderEmbeddingEntity } from './entities/ai/tender-embedding.entity';
import { OrganizationProfileEmbeddingEntity } from './entities/ai/organization-profile-embedding.entity';
import { TenderDocumentChunkEntity } from './entities/ai/tender-document-chunk.entity';
import { TenderChunkEmbeddingEntity } from './entities/ai/tender-chunk-embedding.entity';
import { MatchScoreEntity } from './entities/ai/match-score.entity';
import { EligibilityChecklistItemEntity } from './entities/ai/eligibility-checklist-item.entity';

import { PipelineItemEntity } from './entities/pipeline/pipeline-item.entity';
import { ChecklistTaskEntity } from './entities/pipeline/checklist-task.entity';
import { BidDraftEntity } from './entities/pipeline/bid-draft.entity';
import { SavedSearchEntity } from './entities/pipeline/saved-search.entity';

import { NotificationEntity } from './entities/notifications/notification.entity';
import { NotificationPreferenceEntity } from './entities/notifications/notification-preference.entity';

import { SubscriptionPlanEntity } from './entities/billing/subscription-plan.entity';
import { OrganizationSubscriptionEntity } from './entities/billing/organization-subscription.entity';
import { InvoiceEntity } from './entities/billing/invoice.entity';
import { UsageCounterEntity } from './entities/billing/usage-counter.entity';
import { AuditLogEntity } from './entities/billing/audit-log.entity';
import { DsrRequestEntity } from './entities/billing/dsr-request.entity';

const entities = [
  UserEntity,
  UserOauthIdentityEntity,
  OrganizationEntity,
  OrganizationMemberEntity,
  OrganizationInvitationEntity,
  MsmeProfileEntity,
  MsmeCertificationEntity,
  TenderSourceEntity,
  TenderCategoryEntity,
  TenderEntity,
  TenderCategoryLinkEntity,
  TenderDocumentEntity,
  TenderFieldCorrectionEntity,
  IngestionRunEntity,
  IngestionErrorEntity,
  TenderEmbeddingEntity,
  OrganizationProfileEmbeddingEntity,
  TenderDocumentChunkEntity,
  TenderChunkEmbeddingEntity,
  MatchScoreEntity,
  EligibilityChecklistItemEntity,
  PipelineItemEntity,
  ChecklistTaskEntity,
  BidDraftEntity,
  SavedSearchEntity,
  NotificationEntity,
  NotificationPreferenceEntity,
  SubscriptionPlanEntity,
  OrganizationSubscriptionEntity,
  InvoiceEntity,
  UsageCounterEntity,
  AuditLogEntity,
  DsrRequestEntity,
];

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get<string>('DB_USERNAME'),
        password: config.get<string>('DB_PASSWORD'),
        database: config.get<string>('DB_NAME'),
        entities,
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature(entities),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
