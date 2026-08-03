import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { AssignmentSource } from '@app/database/entities/tender/tender-category-link.entity';

export class CreateCategoryLinkDto {
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
    description: 'Category ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  @IsNotEmpty()
  categoryId!: string;

  @ApiPropertyOptional({
    description: 'Whether this is the primary category for the tender',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isPrimaryCategory?: boolean;

  @ApiPropertyOptional({
    description: 'Confidence score for the category assignment (0-100)',
    example: 92.5,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  confidenceScore?: number;

  @ApiPropertyOptional({
    description: 'User ID who assigned the category',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  assignedByUserId?: string;

  @ApiPropertyOptional({
    description: 'Timestamp the category was assigned',
  })
  @IsOptional()
  @IsDateString()
  assignedAt?: string;

  @ApiPropertyOptional({
    description: 'Source of the category assignment',
    enum: AssignmentSource,
    default: AssignmentSource.MANUAL,
  })
  @IsOptional()
  @IsEnum(AssignmentSource)
  assignmentSource?: AssignmentSource;

  @ApiPropertyOptional({
    description: 'Whether the category link is active',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
