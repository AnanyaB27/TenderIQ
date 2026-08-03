import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateSubscriptionPlanDto {
  @ApiProperty({
    description: 'Plan name',
    maxLength: 255,
    example: 'Growth',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Unique plan code',
    maxLength: 100,
    example: 'GROWTH',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  code!: string;

  @ApiPropertyOptional({
    description: 'Plan description',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Monthly price',
    example: 49.99,
  })
  @Type(() => Number)
  @IsNumber()
  monthlyPrice!: number;

  @ApiProperty({
    description: 'Yearly price',
    example: 499.99,
  })
  @Type(() => Number)
  @IsNumber()
  yearlyPrice!: number;

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

  @ApiProperty({
    description: 'Maximum number of users',
    example: 10,
  })
  @Type(() => Number)
  @IsInt()
  maxUsers!: number;

  @ApiProperty({
    description: 'Maximum tenders trackable per month',
    example: 100,
  })
  @Type(() => Number)
  @IsInt()
  maxTendersPerMonth!: number;

  @ApiProperty({
    description: 'Maximum storage in GB',
    example: 50,
  })
  @Type(() => Number)
  @IsInt()
  maxStorageGb!: number;

  @ApiProperty({
    description: 'AI credits included per month',
    example: 500,
  })
  @Type(() => Number)
  @IsInt()
  aiCreditsPerMonth!: number;

  @ApiPropertyOptional({
    description: 'Feature flags/entitlements',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  features?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Whether the plan is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Display order',
    default: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  displayOrder?: number;
}
