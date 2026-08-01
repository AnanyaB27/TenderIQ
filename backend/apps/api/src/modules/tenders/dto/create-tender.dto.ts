import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  IsUUID,
  MaxLength,
} from 'class-validator';

import {
  TenderStatus,
  TenderType,
} from '@app/database/entities/tender/tender.entity';

export class CreateTenderDto {
  @ApiPropertyOptional({
    description: 'Organization ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  organizationId?: string;

  @ApiProperty({
    description: 'Tender title',
    maxLength: 500,
    example: 'Construction of Government Hospital',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  title!: string;

  @ApiProperty({
    description: 'Tender reference number',
    maxLength: 150,
    example: 'GOV-2026-001',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  referenceNumber!: string;

  @ApiPropertyOptional({
    description: 'Tender description',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Tender source',
    maxLength: 150,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(150)
  source?: string;

  @ApiPropertyOptional({
    description: 'Procurement category',
    maxLength: 150,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(150)
  procurementCategory?: string;

  @ApiPropertyOptional({
    description: 'Tender type',
    enum: TenderType,
    default: TenderType.OPEN,
  })
  @IsOptional()
  @IsEnum(TenderType)
  tenderType?: TenderType;

  @ApiPropertyOptional({
    description: 'Estimated tender value',
    example: 2500000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  estimatedValue?: number;

  @ApiPropertyOptional({
    description: 'Currency',
    maxLength: 10,
    example: 'INR',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsString()
  @MaxLength(10)
  currency?: string;

  @ApiPropertyOptional({
    description: 'Tender publish date',
    example: '2026-08-01T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  publishDate?: string;

  @ApiPropertyOptional({
    description: 'Submission deadline',
    example: '2026-08-15T17:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  submissionDeadline?: string;

  @ApiPropertyOptional({
    description: 'Tender opening date',
    example: '2026-08-16T10:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  openingDate?: string;

  @ApiPropertyOptional({
    description: 'Issuing authority',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(255)
  issuingAuthority?: string;

  @ApiPropertyOptional({
    description: 'Tender location',
    maxLength: 255,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(255)
  location?: string;

  @ApiPropertyOptional({
    description: 'Tender status',
    enum: TenderStatus,
    default: TenderStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(TenderStatus)
  status?: TenderStatus;

  @ApiPropertyOptional({
    description: 'Tender document URL',
    example: 'https://example.com/tender.pdf',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUrl()
  documentUrl?: string;

  @ApiPropertyOptional({
    description: 'User ID of the creator',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  createdByUserId?: string;

  @ApiPropertyOptional({
    description: 'Whether the tender is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}