import { Module } from '@nestjs/common';

import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { InvoicesController } from './invoices.controller';
import { UsageController } from './usage.controller';
import { RazorpayClientService } from './razorpay-client.service';

@Module({
  controllers: [SubscriptionsController, InvoicesController, UsageController],
  providers: [SubscriptionsService, RazorpayClientService],
})
export class BillingModule {}
