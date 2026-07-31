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
import { TenderSourceEntity } from './tender-source.entity';

export enum IngestionRunStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

export enum TriggerType {
  SCHEDULED = 'scheduled',
  MANUAL = 'manual',
  WEBHOOK = 'webhook',
}

@Entity('ingestion_runs')
@Index('IDX_ingestion_run_source', ['tenderSourceId'])
@Index('IDX_ingestion_run_status', ['status'])
@Index('IDX_ingestion_run_started_at', ['startedAt'])
@Index('IDX_ingestion_run_completed_at', ['completedAt'])
export class IngestionRunEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'tender_source_id',
  })
  tenderSourceId!: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'started_at',
  })
  startedAt!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'completed_at',
  })
  completedAt!: Date | null;

  @Column({
    type: 'enum',
    enum: IngestionRunStatus,
    default: IngestionRunStatus.PENDING,
  })
  status!: IngestionRunStatus;

  @Column({
    type: 'int',
    default: 0,
    name: 'total_fetched',
  })
  totalFetched!: number;

  @Column({
    type: 'int',
    default: 0,
    name: 'total_created',
  })
  totalCreated!: number;

  @Column({
    type: 'int',
    default: 0,
    name: 'total_updated',
  })
  totalUpdated!: number;

  @Column({
    type: 'int',
    default: 0,
    name: 'total_skipped',
  })
  totalSkipped!: number;

  @Column({
    type: 'int',
    default: 0,
    name: 'total_failed',
  })
  totalFailed!: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'duration_ms',
  })
  durationMs!: number | null;

  @Column({
    type: 'int',
    default: 0,
    name: 'retry_count',
  })
  retryCount!: number;

  @Column({
    type: 'enum',
    enum: TriggerType,
    default: TriggerType.SCHEDULED,
    name: 'trigger_type',
  })
  triggerType!: TriggerType;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'initiated_by_user_id',
  })
  initiatedByUserId!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'metadata',
  })
  runMetadata!: Record<string, unknown> | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'error_summary',
  })
  errorSummary!: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @ManyToOne(() => TenderSourceEntity, (tenderSource) => tenderSource.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'tender_source_id',
  })
  tenderSource!: TenderSourceEntity;

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