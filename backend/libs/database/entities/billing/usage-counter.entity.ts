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

@Entity('usage_counters')
@Index('IDX_usage_counter_organization', ['organizationId'])
@Index('IDX_usage_counter_metric', ['metric'])
@Index('IDX_usage_counter_period_start', ['billingPeriodStart'])
@Index('IDX_usage_counter_period_end', ['billingPeriodEnd'])
export class UsageCounterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  metric!: string;

  @Column({
    type: 'int',
    default: 0,
    name: 'usage_count',
  })
  usageCount!: number;

  @Column({
    type: 'int',
    name: 'usage_limit',
  })
  usageLimit!: number;

  @Column({
    type: 'timestamp with time zone',
    name: 'billing_period_start',
  })
  billingPeriodStart!: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'billing_period_end',
  })
  billingPeriodEnd!: Date;

  @Column({
    type: 'timestamp with time zone',
    name: 'last_reset_at',
  })
  lastResetAt!: Date;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'metadata',
  })
  metadata!: Record<string, unknown> | null;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: OrganizationEntity;

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