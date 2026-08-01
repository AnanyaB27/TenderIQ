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
  IsUUID,
  MaxLength,
} from 'class-validator';

import { StorageProvider } from '@app/database/entities/tender/tender-document.entity';

export class CreateTenderDocumentDto {
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
    description: 'Original file name',
    maxLength: 255,
    example: 'TenderDocument.pdf',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  originalFileName!: string;

  @ApiProperty({
    description: 'Stored file name',
    maxLength: 255,
    example: '6a9b8c7d.pdf',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  storedFileName!: string;

  @ApiProperty({
    description: 'Storage path',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty()
  filePath!: string;

  @ApiProperty({
    description: 'File MIME type',
    maxLength: 100,
    example: 'application/pdf',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fileType!: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 524288,
  })
  @Type(() => Number)
  @IsNumber()
  @IsNotEmpty()
  fileSize!: number;

  @ApiPropertyOptional({
    description: 'Checksum',
    maxLength: 128,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(128)
  checksum?: string;

  @ApiPropertyOptional({
    description: 'Uploaded by user ID',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  uploadedByUserId?: string;

  @ApiPropertyOptional({
    enum: StorageProvider,
    default: StorageProvider.S3,
  })
  @IsOptional()
  @IsEnum(StorageProvider)
  storageProvider?: StorageProvider;

  @ApiPropertyOptional({
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  isProcessed?: boolean;

  @ApiPropertyOptional({
    description: 'Processing timestamp',
  })
  @IsOptional()
  @IsDateString()
  processedAt?: string;

  @ApiPropertyOptional({
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}