import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateUsageCounterDto {
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
    description: 'Metric being tracked',
    maxLength: 255,
    example: 'ai_credits',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  metric!: string;

  @ApiPropertyOptional({
    description: 'Current usage count',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  usageCount?: number;

  @ApiProperty({
    description: 'Usage limit for the billing period',
    example: 500,
  })
  @Type(() => Number)
  @IsInt()
  usageLimit!: number;

  @ApiProperty({
    description: 'Billing period start',
  })
  @IsDateString()
  @IsNotEmpty()
  billingPeriodStart!: string;

  @ApiProperty({
    description: 'Billing period end',
  })
  @IsDateString()
  @IsNotEmpty()
  billingPeriodEnd!: string;

  @ApiProperty({
    description: 'Timestamp the counter was last reset',
  })
  @IsDateString()
  @IsNotEmpty()
  lastResetAt!: string;

  @ApiPropertyOptional({
    description: 'Additional structured metadata',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;
}
