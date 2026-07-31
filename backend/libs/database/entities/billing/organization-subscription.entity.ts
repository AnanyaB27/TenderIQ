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
import { SubscriptionPlanEntity } from './subscription-plan.entity';

export enum SubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum BillingCycle {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

@Entity('organization_subscriptions')
@Index('IDX_org_subscription_organization', ['organizationId'])
@Index('IDX_org_subscription_plan', ['subscriptionPlanId'])
@Index('IDX_org_subscription_status', ['status'])
@Index('IDX_org_subscription_billing_cycle', ['billingCycle'])
@Index('IDX_org_subscription_next_billing', ['nextBillingDate'])
export class OrganizationSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId!: string;

  @Column({
    type: 'uuid',
    name: 'subscription_plan_id',
  })
  subscriptionPlanId!: string;

  @Column({
    type: 'enum',
    enum: SubscriptionStatus,
    default: SubscriptionStatus.TRIAL,
  })
  status!: SubscriptionStatus;

  @Column({
    type: 'enum',
    enum: BillingCycle,
    default: BillingCycle.MONTHLY,
    name: 'billing_cycle',
  })
  billingCycle!: BillingCycle;

  @Column({
    type: 'timestamp with time zone',
    name: 'start_date',
  })
  startDate!: Date;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'end_date',
  })
  endDate!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'next_billing_date',
  })
  nextBillingDate!: Date | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'auto_renew',
  })
  autoRenew!: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'external_subscription_id',
  })
  externalSubscriptionId!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
    name: 'payment_provider',
  })
  paymentProvider!: string | null;

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

  @ManyToOne(() => SubscriptionPlanEntity, (plan) => plan.id, {
    onDelete: 'RESTRICT',
  })
  @JoinColumn({
    name: 'subscription_plan_id',
  })
  subscriptionPlan!: SubscriptionPlanEntity;

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