import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateMemberDto {
  @ApiProperty({
    description: 'User ID of the organization member',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsUUID()
  @IsNotEmpty({
    message: 'User ID is required.',
  })
  userId!: string;

  @ApiProperty({
    description: 'Role assigned to the organization member',
    example: 'ADMIN',
    minLength: 2,
    maxLength: 100,
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({
    message: 'Role is required.',
  })
  @MinLength(2)
  @MaxLength(100)
  role!: string;

  @ApiPropertyOptional({
    description: 'Whether this member is the primary organization contact',
    example: false,
    default: false,
  })
  @IsOptional()
  @Transform(({ value }) => Boolean(value))
  @IsBoolean()
  isPrimary?: boolean;
}