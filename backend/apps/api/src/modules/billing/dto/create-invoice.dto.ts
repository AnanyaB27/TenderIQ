import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { InvoiceStatus } from '@app/database/entities/billing/invoice.entity';

export class CreateInvoiceDto {
  @ApiProperty({
    description: 'Organization subscription ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  @IsNotEmpty()
  organizationSubscriptionId!: string;

  @ApiProperty({
    description: 'Unique invoice number',
    maxLength: 255,
    example: 'INV-2026-000123',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  invoiceNumber!: string;

  @ApiPropertyOptional({
    description: 'Invoice status',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  @IsOptional()
  @IsEnum(InvoiceStatus)
  status?: InvoiceStatus;

  @ApiProperty({
    description: 'Invoice amount before tax',
    example: 49.99,
  })
  @Type(() => Number)
  @IsNumber()
  amount!: number;

  @ApiPropertyOptional({
    description: 'Currency code',
    default: 'USD',
    maxLength: 10,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Tax amount',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  taxAmount?: number;

  @ApiProperty({
    description: 'Total amount including tax',
    example: 54.99,
  })
  @Type(() => Number)
  @IsNumber()
  totalAmount!: number;

  @ApiProperty({
    description: 'Payment provider name',
    maxLength: 100,
    example: 'razorpay',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  paymentProvider!: string;

  @ApiPropertyOptional({
    description: 'External payment provider invoice ID',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(255)
  externalInvoiceId?: string;

  @ApiPropertyOptional({
    description: 'URL to the hosted invoice document',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  invoiceUrl?: string;

  @ApiProperty({
    description: 'Timestamp the invoice was issued',
  })
  @IsDateString()
  @IsNotEmpty()
  issuedAt!: string;

  @ApiProperty({
    description: 'Invoice due date',
  })
  @IsDateString()
  @IsNotEmpty()
  dueAt!: string;

  @ApiPropertyOptional({
    description: 'Timestamp the invoice was paid',
  })
  @IsOptional()
  @IsDateString()
  paidAt?: string;

  @ApiPropertyOptional({
    description: 'Additional structured metadata',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
