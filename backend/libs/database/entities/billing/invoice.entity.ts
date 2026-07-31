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
import { OrganizationSubscriptionEntity } from './organization-subscription.entity';

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

@Entity('invoices')
@Index('IDX_invoice_subscription', ['organizationSubscriptionId'])
@Index('IDX_invoice_number', ['invoiceNumber'], { unique: true })
@Index('IDX_invoice_status', ['status'])
@Index('IDX_invoice_issued_at', ['issuedAt'])
@Index('IDX_invoice_due_at', ['dueAt'])
@Index('IDX_invoice_paid_at', ['paidAt'])
export class InvoiceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_subscription_id',
  })
  organizationSubscriptionId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    name: 'invoice_number',
  })
  invoiceNumber!: string;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.DRAFT,
  })
  status!: InvoiceStatus;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
  })
  amount!: number;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'USD',
    name: 'currency',
  })
  currency!: string;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
    name: 'tax_amount',
  })
  taxAmount!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'total_amount',
  })
  totalAmount!: number;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'payment_provider',
  })
  paymentProvider!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'external_invoice_id',
  })
  externalInvoiceId!: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'invoice_url',
  })
  invoiceUrl!: string | null;

  @Column({
    type: 'timestamp with time zone',
    name: 'issued_at',
  })
  issuedAt!: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'due_at',
  })
  dueAt!: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'paid_at',
  })
  paidAt!: Date | null;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'metadata',
  })
  metadata!: Record<string, unknown> | null;

  @ManyToOne(() => OrganizationSubscriptionEntity, (subscription) => subscription.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_subscription_id',
  })
  organizationSubscription!: OrganizationSubscriptionEntity;

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