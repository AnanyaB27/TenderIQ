import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import {
  PipelinePriority,
  PipelineStage,
} from '@app/database/entities/pipeline/pipeline-item.entity';

export class CreatePipelineItemDto {
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
    description: 'Tender ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  @IsNotEmpty()
  tenderId!: string;

  @ApiPropertyOptional({
    description: 'Pipeline stage',
    enum: PipelineStage,
    default: PipelineStage.DISCOVERED,
  })
  @IsOptional()
  @IsEnum(PipelineStage)
  stage?: PipelineStage;

  @ApiPropertyOptional({
    description: 'Pipeline priority',
    enum: PipelinePriority,
    default: PipelinePriority.MEDIUM,
  })
  @IsOptional()
  @IsEnum(PipelinePriority)
  priority?: PipelinePriority;

  @ApiPropertyOptional({
    description: 'User ID assigned to this pipeline item',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  assignedToUserId?: string;

  @ApiPropertyOptional({
    description: 'Due date for this pipeline item',
  })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Notes',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Whether this pipeline item is archived',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;
}
