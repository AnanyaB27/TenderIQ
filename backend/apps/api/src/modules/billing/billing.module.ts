import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SubscriptionPlanEntity } from '@app/database/entities/billing/subscription-plan.entity';
import { OrganizationSubscriptionEntity } from '@app/database/entities/billing/organization-subscription.entity';
import { InvoiceEntity } from '@app/database/entities/billing/invoice.entity';
import { UsageCounterEntity } from '@app/database/entities/billing/usage-counter.entity';

import { PlansController } from './plans.controller';
import { SubscriptionsController } from './subscriptions.controller';
import { InvoicesController } from './invoices.controller';
import { UsageController } from './usage.controller';

import { PlansService } from './plans.service';
import { SubscriptionsService } from './subscriptions.service';
import { InvoicesService } from './invoices.service';
import { UsageService } from './usage.service';
import { RazorpayClientService } from './razorpay-client.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SubscriptionPlanEntity,
      OrganizationSubscriptionEntity,
      InvoiceEntity,
      UsageCounterEntity,
    ]),
  ],
  controllers: [
    PlansController,
    SubscriptionsController,
    InvoicesController,
    UsageController,
  ],
  providers: [
    PlansService,
    SubscriptionsService,
    InvoicesService,
    UsageService,
    RazorpayClientService,
  ],
  exports: [
    PlansService,
    SubscriptionsService,
    InvoicesService,
    UsageService,
  ],
})
export class BillingModule {}
