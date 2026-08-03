import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';

import { AuthenticationType } from '@app/database/entities/tender/tender-source.entity';

export class CreateTenderSourceDto {
  @ApiProperty({
    description: 'Source name',
    maxLength: 150,
    example: 'Government e-Marketplace',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name!: string;

  @ApiProperty({
    description: 'Unique source code',
    maxLength: 50,
    example: 'GEM',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toUpperCase() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  code!: string;

  @ApiPropertyOptional({
    description: 'Source description',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Base URL of the source portal',
    maxLength: 512,
    example: 'https://gem.gov.in',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUrl({
    require_protocol: true,
  })
  @MaxLength(512)
  baseUrl?: string;

  @ApiPropertyOptional({
    description: 'Country of the source portal',
    default: 'India',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({
    description: 'Whether the source is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'Whether the source supports incremental sync',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  supportsIncrementalSync?: boolean;

  @ApiPropertyOptional({
    description: 'Sync frequency in minutes',
    default: 360,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  syncFrequencyMinutes?: number;

  @ApiPropertyOptional({
    description: 'Authentication type required by the source',
    enum: AuthenticationType,
    default: AuthenticationType.NONE,
  })
  @IsOptional()
  @IsEnum(AuthenticationType)
  authenticationType?: AuthenticationType;
}
