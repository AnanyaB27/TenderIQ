import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUrl,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCertificationDto {
  @ApiProperty({
    description: 'Type of certification',
    example: 'ISO 9001',
    minLength: 2,
    maxLength: 100,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Certificate type is required.',
  })
  @MinLength(2)
  @MaxLength(100)
  certificateType!: string;

  @ApiProperty({
    description: 'Certification number',
    example: 'ISO9001-2026-001',
    maxLength: 100,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Certificate number is required.',
  })
  @MaxLength(100)
  certificateNumber!: string;

  @ApiProperty({
    description: 'Issuing authority',
    example: 'Bureau of Indian Standards',
    maxLength: 255,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Issuing authority is required.',
  })
  @MaxLength(255)
  issuingAuthority!: string;

  @ApiProperty({
    description: 'Certificate issue date',
    example: '2026-01-15',
  })
  @IsDateString({}, {
    message: 'Issued date must be a valid ISO 8601 date.',
  })
  @IsNotEmpty({
    message: 'Issued date is required.',
  })
  issuedAt!: string;

  @ApiPropertyOptional({
    description: 'Certificate expiry date',
    example: '2029-01-15',
  })
  @IsOptional()
  @IsDateString({}, {
    message: 'Expiry date must be a valid ISO 8601 date.',
  })
  expiresAt?: string;

  @ApiPropertyOptional({
    description: 'Supporting document URL',
    example: 'https://example.com/certificates/iso9001.pdf',
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUrl({
    require_protocol: true,
  })
  documentUrl?: string;

  @ApiPropertyOptional({
    description: 'Additional remarks',
    example: 'Renewal due next quarter.',
    maxLength: 500,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(500)
  remarks?: string;
}