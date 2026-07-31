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
import { TenderEntity } from './tender.entity';

export enum CorrectionSource {
  MANUAL = 'manual',
  AI = 'ai',
  IMPORTED = 'imported',
}

@Entity('tender_field_corrections')
@Index('IDX_tender_field_correction_tender', ['tenderId'])
@Index('IDX_tender_field_correction_field', ['fieldName'])
@Index('IDX_tender_field_correction_source', ['correctionSource'])
export class TenderFieldCorrectionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'tender_id',
  })
  tenderId!: string;

  @Column({
    type: 'varchar',
    length: 150,
    name: 'field_name',
  })
  fieldName!: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'original_value',
  })
  originalValue!: string | null;

  @Column({
    type: 'text',
    name: 'corrected_value',
  })
  correctedValue!: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'correction_reason',
  })
  correctionReason!: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'corrected_by_user_id',
  })
  correctedByUserId!: string | null;

  @Column({
    type: 'enum',
    enum: CorrectionSource,
    default: CorrectionSource.MANUAL,
    name: 'correction_source',
  })
  correctionSource!: CorrectionSource;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'confidence_before',
  })
  confidenceBefore!: number | null;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'confidence_after',
  })
  confidenceAfter!: number | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'metadata',
  })
  metadata!: Record<string, unknown> | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

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