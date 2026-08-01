import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from '../identity/organization.entity';
import { UserEntity } from '../identity/user.entity';

@Entity('audit_logs')
@Index('IDX_audit_log_organization', ['organizationId'])
@Index('IDX_audit_log_user', ['userId'])
@Index('IDX_audit_log_action', ['action'])
@Index('IDX_audit_log_resource_type', ['resourceType'])
@Index('IDX_audit_log_resource_id', ['resourceId'])
@Index('IDX_audit_log_created_at', ['createdAt'])
export class AuditLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'organization_id',
  })
  organizationId!: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'user_id',
  })
  userId!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  action!: string;

  @Column({
    type: 'varchar',
    length: 150,
    name: 'resource_type',
  })
  resourceType!: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'resource_id',
  })
  resourceId!: string | null;

  @Column({
    type: 'varchar',
    length: 45,
    nullable: true,
    name: 'ip_address',
  })
  ipAddress!: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'user_agent',
  })
  userAgent!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'old_values',
  })
  oldValues!: Record<string, unknown> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'new_values',
  })
  newValues!: Record<string, unknown> | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'metadata',
  })
  metadata!: Record<string, unknown> | null;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: OrganizationEntity | null;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: UserEntity | null;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt!: Date;
}