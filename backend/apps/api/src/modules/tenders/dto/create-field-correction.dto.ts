import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { CorrectionSource } from '@app/database/entities/tender/tender-field-correction.entity';

export class CreateFieldCorrectionDto {
  @ApiProperty({
    description: 'Tender ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  @IsNotEmpty()
  tenderId!: string;

  @ApiProperty({
    description: 'Name of the field being corrected',
    maxLength: 150,
    example: 'submissionDeadline',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  fieldName!: string;

  @ApiPropertyOptional({
    description: 'Original value before correction',
  })
  @IsOptional()
  @IsString()
  originalValue?: string;

  @ApiProperty({
    description: 'Corrected value',
  })
  @IsString()
  @IsNotEmpty()
  correctedValue!: string;

  @ApiPropertyOptional({
    description: 'Reason for the correction',
  })
  @IsOptional()
  @IsString()
  correctionReason?: string;

  @ApiPropertyOptional({
    description: 'User ID who made the correction',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  correctedByUserId?: string;

  @ApiPropertyOptional({
    description: 'Source of the correction',
    enum: CorrectionSource,
    default: CorrectionSource.MANUAL,
  })
  @IsOptional()
  @IsEnum(CorrectionSource)
  correctionSource?: CorrectionSource;

  @ApiPropertyOptional({
    description: 'Extraction confidence before the correction (0-100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  confidenceBefore?: number;

  @ApiPropertyOptional({
    description: 'Extraction confidence after the correction (0-100)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  confidenceAfter?: number;

  @ApiPropertyOptional({
    description: 'Additional structured metadata',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Whether the correction is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
