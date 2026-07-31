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

export enum BidDraftStatus {
  DRAFT = 'DRAFT',
  REVIEW = 'REVIEW',
  APPROVED = 'APPROVED',
  SUBMITTED = 'SUBMITTED',
  REJECTED = 'REJECTED',
}

@Entity('bid_drafts')
@Index('IDX_bid_draft_pipeline_item', ['pipelineItemId'])
@Index('IDX_bid_draft_status', ['status'])
@Index('IDX_bid_draft_version', ['version'])
@Index('IDX_bid_draft_generated_by_ai', ['generatedByAi'])
export class BidDraftEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'pipeline_item_id',
  })
  pipelineItemId!: string;

  @Column({
    type: 'int',
    default: 1,
  })
  version!: number;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
    name: 'content',
  })
  content!: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'generated_by_ai',
  })
  generatedByAi!: boolean;

  @Column({
    type: 'enum',
    enum: BidDraftStatus,
    default: BidDraftStatus.DRAFT,
  })
  status!: BidDraftStatus;

  @Column({
    type: 'text',
    nullable: true,
    name: 'file_url',
  })
  fileUrl!: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'submitted_at',
  })
  submittedAt!: Date | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'created_by_user_id',
  })
  createdByUserId!: string | null;

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