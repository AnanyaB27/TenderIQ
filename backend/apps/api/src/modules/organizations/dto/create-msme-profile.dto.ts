import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMsmeProfileDto {
  @ApiProperty({
    description: 'Registered MSME enterprise name',
    example: 'ABC Engineering Works',
    minLength: 2,
    maxLength: 255,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Enterprise name is required.',
  })
  @MinLength(2)
  @MaxLength(255)
  enterpriseName!: string;

  @ApiProperty({
    description: 'Udyam Registration Number',
    example: 'UDYAM-KR-03-0001234',
    maxLength: 50,
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toUpperCase()
      : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Udyam registration number is required.',
  })
  @MaxLength(50)
  udyamRegistrationNumber!: string;

  @ApiProperty({
    description: 'Enterprise classification',
    example: 'Micro',
    maxLength: 50,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Enterprise type is required.',
  })
  @MaxLength(50)
  enterpriseType!: string;

  @ApiPropertyOptional({
    description: 'Primary business activity',
    example: 'Manufacturing',
    maxLength: 100,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(100)
  majorActivity?: string;

  @ApiPropertyOptional({
    description: 'Social category',
    example: 'General',
    maxLength: 50,
  })
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(50)
  socialCategory?: string;

  @ApiPropertyOptional({
    description: 'Date of incorporation',
    example: '2023-04-15',
  })
  @IsOptional()
  @IsDateString({}, {
    message: 'Date of incorporation must be a valid ISO 8601 date.',
  })
  dateOfIncorporation?: string;

  @ApiPropertyOptional({
    description: 'Investment in plant and machinery',
    example: 2500000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  investmentInPlant?: number;

  @ApiPropertyOptional({
    description: 'Annual turnover',
    example: 12000000,
    minimum: 0,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  annualTurnover?: number;
}