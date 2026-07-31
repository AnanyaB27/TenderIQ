import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
  Index,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';

export enum OrganizationInvitationRole {
  OWNER = 'owner',
  ADMIN = 'admin',
  MEMBER = 'member',
}

export enum OrganizationInvitationStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

@Entity('organization_invitations')
@Unique('UQ_organization_invitation_email', ['organizationId', 'email'])
export class OrganizationInvitationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  email!: string;

  @Column({
    type: 'enum',
    enum: OrganizationInvitationRole,
    default: OrganizationInvitationRole.MEMBER,
  })
  role!: OrganizationInvitationRole;

  @Index()
  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
  })
  token!: string;

  @Column({
    type: 'enum',
    enum: OrganizationInvitationStatus,
    default: OrganizationInvitationStatus.PENDING,
  })
  status!: OrganizationInvitationStatus;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'invited_by_user_id',
  })
  invitedByUserId!: string | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'expires_at',
  })
  expiresAt!: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'accepted_at',
  })
  acceptedAt!: Date | null;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @ManyToOne(
    () => OrganizationEntity,
    (organization) => organization.invitations,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: OrganizationEntity;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt!: Date;
}