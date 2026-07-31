import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { TenderEntity } from './tender.entity';
import { TenderCategoryEntity } from './tender-category.entity';

export enum AssignmentSource {
  MANUAL = 'manual',
  AI = 'ai',
  IMPORTED = 'imported',
}

@Entity('tender_category_links')
@Unique('UQ_tender_category_pair', ['tenderId', 'categoryId'])
@Index('IDX_tender_category_link_tender', ['tenderId'])
@Index('IDX_tender_category_link_category', ['categoryId'])
@Index('IDX_tender_category_link_primary', ['isPrimaryCategory'])
export class TenderCategoryLinkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'tender_id',
  })
  tenderId!: string;

  @Column({
    type: 'uuid',
    name: 'category_id',
  })
  categoryId!: string;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_primary_category',
  })
  isPrimaryCategory!: boolean;

  @Column({
    type: 'numeric',
    precision: 5,
    scale: 2,
    nullable: true,
    name: 'confidence_score',
  })
  confidenceScore!: number | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'assigned_by_user_id',
  })
  assignedByUserId!: string | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'assigned_at',
  })
  assignedAt!: Date | null;

  @Column({
    type: 'enum',
    enum: AssignmentSource,
    default: AssignmentSource.MANUAL,
    name: 'assignment_source',
  })
  assignmentSource!: AssignmentSource;

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

  @ManyToOne(() => TenderCategoryEntity, (category) => category.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'category_id',
  })
  category!: TenderCategoryEntity;

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