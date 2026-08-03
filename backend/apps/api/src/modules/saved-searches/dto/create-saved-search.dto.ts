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

import { SortDirection } from '@app/database/entities/pipeline/saved-search.entity';

export class CreateSavedSearchDto {
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
    description: 'Saved search name',
    maxLength: 255,
    example: 'Construction tenders in Karnataka',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name!: string;

  @ApiProperty({
    description: 'Search query string',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  searchQuery!: string;

  @ApiPropertyOptional({
    description: 'Additional structured filters',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'Field to sort results by',
    default: 'createdAt',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  sortBy?: string;

  @ApiPropertyOptional({
    description: 'Sort direction',
    enum: SortDirection,
    default: SortDirection.DESC,
  })
  @IsOptional()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection;

  @ApiPropertyOptional({
    description: 'Whether to notify on new matches',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnNewMatches?: boolean;

  @ApiPropertyOptional({
    description: 'Whether this is the default saved search',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @ApiPropertyOptional({
    description: 'Timestamp the search was last executed',
  })
  @IsOptional()
  @IsDateString()
  lastExecutedAt?: string;
}
