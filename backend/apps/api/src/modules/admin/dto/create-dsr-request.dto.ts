import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

import {
  DsrRequestStatus,
  DsrRequestType,
} from '@app/database/entities/billing/dsr-request.entity';

export class CreateDsrRequestDto {
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
    description: 'User ID who submitted the request',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  @IsNotEmpty()
  requestedByUserId!: string;

  @ApiProperty({
    description: 'Type of data subject request',
    enum: DsrRequestType,
  })
  @IsEnum(DsrRequestType)
  @IsNotEmpty()
  requestType!: DsrRequestType;

  @ApiPropertyOptional({
    description: 'Request status',
    enum: DsrRequestStatus,
    default: DsrRequestStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(DsrRequestStatus)
  status?: DsrRequestStatus;

  @ApiPropertyOptional({
    description: 'Reason for the request',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  reason?: string;

  @ApiPropertyOptional({
    description: 'Additional structured request data',
    type: 'object',
    additionalProperties: true,
  })
  @IsOptional()
  @IsObject()
  requestData?: Record<string, unknown>;

  @ApiPropertyOptional({
    description: 'User ID who processed the request',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  processedByUserId?: string;

  @ApiPropertyOptional({
    description: 'Timestamp the request was processed',
  })
  @IsOptional()
  @IsDateString()
  processedAt?: string;

  @ApiPropertyOptional({
    description: 'Completion notes',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  completionNotes?: string;
}
