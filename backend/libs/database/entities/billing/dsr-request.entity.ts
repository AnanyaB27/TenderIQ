import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { OrganizationEntity } from '../identity/organization.entity';
import { UserEntity } from '../identity/user.entity';

export enum DsrRequestType {
  EXPORT_DATA = 'EXPORT_DATA',
  DELETE_DATA = 'DELETE_DATA',
  ANONYMIZE_DATA = 'ANONYMIZE_DATA',
}

export enum DsrRequestStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  REJECTED = 'REJECTED',
}

@Entity('dsr_requests')
@Index('IDX_dsr_request_organization', ['organizationId'])
@Index('IDX_dsr_request_requested_by', ['requestedByUserId'])
@Index('IDX_dsr_request_processed_by', ['processedByUserId'])
@Index('IDX_dsr_request_type', ['requestType'])
@Index('IDX_dsr_request_status', ['status'])
@Index('IDX_dsr_request_created_at', ['createdAt'])
export class DsrRequestEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId!: string;

  @Column({
    type: 'uuid',
    name: 'requested_by_user_id',
  })
  requestedByUserId!: string;

  @Column({
    type: 'enum',
    enum: DsrRequestType,
    name: 'request_type',
  })
  requestType!: DsrRequestType;

  @Column({
    type: 'enum',
    enum: DsrRequestStatus,
    default: DsrRequestStatus.PENDING,
  })
  status!: DsrRequestStatus;

  @Column({
    type: 'text',
    nullable: true,
    name: 'reason',
  })
  reason!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'request_data',
  })
  requestData!: Record<string, unknown> | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'processed_by_user_id',
  })
  processedByUserId!: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'processed_at',
  })
  processedAt!: Date | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'completion_notes',
  })
  completionNotes!: string | null;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: OrganizationEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'requested_by_user_id',
  })
  requestedByUser!: UserEntity;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'processed_by_user_id',
  })
  processedByUser!: UserEntity | null;

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