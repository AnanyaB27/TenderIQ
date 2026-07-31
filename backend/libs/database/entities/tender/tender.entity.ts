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

export enum TenderType {
  OPEN = 'open',
  LIMITED = 'limited',
  SINGLE = 'single',
  GLOBAL = 'global',
}

export enum TenderStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ACTIVE = 'active',
  EVALUATION = 'evaluation',
  AWARDED = 'awarded',
  CANCELLED = 'cancelled',
  CLOSED = 'closed',
}

@Entity('tenders')
export class TenderEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'organization_id',
  })
  organizationId!: string | null;

  @Column({
    type: 'varchar',
    length: 500,
  })
  title!: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 150,
    unique: true,
    name: 'reference_number',
  })
  referenceNumber!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
  })
  source!: string | null;

  @Column({
    type: 'varchar',
    length: 150,
    nullable: true,
    name: 'procurement_category',
  })
  procurementCategory!: string | null;

  @Column({
    type: 'enum',
    enum: TenderType,
    default: TenderType.OPEN,
    name: 'tender_type',
  })
  tenderType!: TenderType;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'estimated_value',
  })
  estimatedValue!: number | null;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'INR',
  })
  currency!: string;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'publish_date',
  })
  publishDate!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'submission_deadline',
  })
  submissionDeadline!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'opening_date',
  })
  openingDate!: Date | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'issuing_authority',
  })
  issuingAuthority!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  location!: string | null;

  @Index()
  @Column({
    type: 'enum',
    enum: TenderStatus,
    default: TenderStatus.PUBLISHED,
  })
  status!: TenderStatus;

  @Column({
    type: 'text',
    nullable: true,
    name: 'document_url',
  })
  documentUrl!: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'created_by_user_id',
  })
  createdByUserId!: string | null;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.id, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: OrganizationEntity | null;

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