import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateInvitationDto {
  @ApiProperty({
    description: 'Email address of the invited user',
    example: 'john.doe@example.com',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail({}, {
    message: 'A valid email address is required.',
  })
  @IsNotEmpty({
    message: 'Email is required.',
  })
  email!: string;

  @ApiProperty({
    description: 'Role to assign to the invited user',
    example: 'MEMBER',
    minLength: 2,
    maxLength: 100,
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim()
      : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Role is required.',
  })
  @MinLength(2)
  @MaxLength(100)
  role!: string;

  @ApiPropertyOptional({
    description: 'Invitation expiration date (ISO 8601 format)',
    example: '2026-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, {
    message: 'Expiration date must be a valid ISO 8601 date string.',
  })
  expiresAt?: string;
}