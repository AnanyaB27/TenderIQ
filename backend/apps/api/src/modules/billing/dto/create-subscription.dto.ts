import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  BillingCycle,
  SubscriptionStatus,
} from '@app/database/entities/billing/organization-subscription.entity';

export class CreateSubscriptionDto {
  @ApiProperty({
    description: 'Organization ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  @IsNotEmpty()
  organizationId!: string;

  @ApiProperty({
    description: 'Subscription plan ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  @IsNotEmpty()
  subscriptionPlanId!: string;

  @ApiPropertyOptional({
    description: 'Subscription status',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @ApiPropertyOptional({
    description: 'Billing cycle',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
  })
  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @ApiProperty({
    description: 'Subscription start date',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate!: string;

  @ApiPropertyOptional({
    description: 'Subscription end date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Next billing date',
  })
  @IsOptional()
  @IsDateString()
  nextBillingDate?: string;

  @ApiPropertyOptional({
    description: 'Whether the subscription auto-renews',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @ApiPropertyOptional({
    description: 'External payment provider subscription ID',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(255)
  externalSubscriptionId?: string;

  @ApiPropertyOptional({
    description: 'Payment provider name',
    maxLength: 100,
    example: 'razorpay',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  paymentProvider?: string;

  @ApiPropertyOptional({
    description: 'Additional structured metadata',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
