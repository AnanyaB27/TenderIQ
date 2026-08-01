import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsDateString,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

import {
  OrganizationInvitationRole,
  OrganizationInvitationStatus,
} from '@app/database/entities/identity/organization-invitation.entity';

export class CreateInvitationDto {
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
    description: 'Invitee email',
    example: 'john@example.com',
  })
  @Transform(({ value }) =>
    typeof value === 'string'
      ? value.trim().toLowerCase()
      : value,
  )
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @ApiProperty({
    enum: OrganizationInvitationRole,
    example: OrganizationInvitationRole.MEMBER,
  })
  @IsEnum(OrganizationInvitationRole)
  role!: OrganizationInvitationRole;

  @ApiProperty({
    description: 'Invitation token',
    example: '8d0d0b70b1d14d8cae67d8fbc7a9f123',
  })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsNotEmpty()
  token!: string;

  @ApiPropertyOptional({
    enum: OrganizationInvitationStatus,
    default: OrganizationInvitationStatus.PENDING,
  })
  @IsOptional()
  @IsEnum(OrganizationInvitationStatus)
  status?: OrganizationInvitationStatus;

  @ApiPropertyOptional({
    description: 'User who sent the invitation',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsOptional()
  @IsUUID()
  invitedByUserId?: string;

  @ApiProperty({
    description: 'Invitation expiry date',
    example: '2026-12-31T23:59:59Z',
  })
  @IsDateString()
  expiresAt!: string;

  @ApiPropertyOptional({
    description: 'Invitation accepted date',
    example: '2026-08-01T10:30:00Z',
  })
  @IsOptional()
  @IsDateString()
  acceptedAt?: string;

  @ApiPropertyOptional({
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}