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
import { TenderEntity } from '../tender/tender.entity';

export enum PipelineStage {
  DISCOVERED = 'DISCOVERED',
  REVIEWING = 'REVIEWING',
  ELIGIBLE = 'ELIGIBLE',
  BID_IN_PROGRESS = 'BID_IN_PROGRESS',
  SUBMITTED = 'SUBMITTED',
  WON = 'WON',
  LOST = 'LOST',
  ARCHIVED = 'ARCHIVED',
}

export enum PipelinePriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('pipeline_items')
@Index('IDX_pipeline_organization', ['organizationId'])
@Index('IDX_pipeline_tender', ['tenderId'])
@Index('IDX_pipeline_stage', ['stage'])
@Index('IDX_pipeline_priority', ['priority'])
@Index('IDX_pipeline_due_date', ['dueDate'])
export class PipelineItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId!: string;

  @Column({
    type: 'uuid',
    name: 'tender_id',
  })
  tenderId!: string;

  @Column({
    type: 'enum',
    enum: PipelineStage,
    default: PipelineStage.DISCOVERED,
  })
  stage!: PipelineStage;

  @Column({
    type: 'enum',
    enum: PipelinePriority,
    default: PipelinePriority.MEDIUM,
  })
  priority!: PipelinePriority;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'assigned_to_user_id',
  })
  assignedToUserId!: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'due_date',
  })
  dueDate!: Date | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'notes',
  })
  notes!: string | null;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_archived',
  })
  isArchived!: boolean;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: OrganizationEntity;

  @ManyToOne(() => TenderEntity, (tender) => tender.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'tender_id',
  })
  tender!: TenderEntity;

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