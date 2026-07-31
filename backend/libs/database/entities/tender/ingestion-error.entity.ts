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
import { IngestionRunEntity } from './ingestion-run.entity';
import { TenderSourceEntity } from './tender-source.entity';

export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical',
}

@Entity('ingestion_errors')
@Index('IDX_ingestion_error_run', ['ingestionRunId'])
@Index('IDX_ingestion_error_source', ['tenderSourceId'])
@Index('IDX_ingestion_error_severity', ['severity'])
@Index('IDX_ingestion_error_retryable', ['retryable'])
@Index('IDX_ingestion_error_resolved', ['resolved'])
export class IngestionErrorEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'ingestion_run_id',
  })
  ingestionRunId!: string;

  @Column({
    type: 'uuid',
    name: 'tender_source_id',
  })
  tenderSourceId!: string;

  @Column({
    type: 'enum',
    enum: ErrorSeverity,
    default: ErrorSeverity.ERROR,
  })
  severity!: ErrorSeverity;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'error_code',
  })
  errorCode!: string;

  @Column({
    type: 'text',
    name: 'error_message',
  })
  errorMessage!: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'stack_trace',
  })
  stackTrace!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'external_reference',
  })
  externalReference!: string | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'payload',
  })
  payload!: Record<string, unknown> | null;

  @Column({
    type: 'boolean',
    default: false,
  })
  retryable!: boolean;

  @Column({
    type: 'boolean',
    default: false,
  })
  resolved!: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'resolved_at',
  })
  resolvedAt!: Date | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'resolved_by_user_id',
  })
  resolvedByUserId!: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @ManyToOne(() => IngestionRunEntity, (ingestionRun) => ingestionRun.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'ingestion_run_id',
  })
  ingestionRun!: IngestionRunEntity;

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