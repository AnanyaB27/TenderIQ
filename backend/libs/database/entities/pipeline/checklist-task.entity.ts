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
import { PipelineItemEntity } from './pipeline-item.entity';

export enum TaskType {
  DOCUMENT = 'DOCUMENT',
  REVIEW = 'REVIEW',
  APPROVAL = 'APPROVAL',
  PAYMENT = 'PAYMENT',
  SUBMISSION = 'SUBMISSION',
  OTHER = 'OTHER',
}

export enum TaskStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum TaskPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('checklist_tasks')
@Index('IDX_checklist_pipeline_item', ['pipelineItemId'])
@Index('IDX_checklist_status', ['status'])
@Index('IDX_checklist_priority', ['priority'])
@Index('IDX_checklist_due_date', ['dueDate'])
@Index('IDX_checklist_sort_order', ['sortOrder'])
export class ChecklistTaskEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'pipeline_item_id',
  })
  pipelineItemId!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'description',
  })
  description!: string | null;

  @Column({
    type: 'enum',
    enum: TaskType,
    default: TaskType.OTHER,
    name: 'task_type',
  })
  taskType!: TaskType;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.PENDING,
  })
  status!: TaskStatus;

  @Column({
    type: 'enum',
    enum: TaskPriority,
    default: TaskPriority.MEDIUM,
  })
  priority!: TaskPriority;

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
    type: 'timestamp with time zone',
    nullable: true,
    name: 'completed_at',
  })
  completedAt!: Date | null;

  @Column({
    type: 'int',
    default: 0,
    name: 'sort_order',
  })
  sortOrder!: number;

  @ManyToOne(() => PipelineItemEntity, (pipelineItem) => pipelineItem.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'pipeline_item_id',
  })
  pipelineItem!: PipelineItemEntity;

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