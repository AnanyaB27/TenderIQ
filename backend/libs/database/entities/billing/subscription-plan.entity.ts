import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('subscription_plans')
@Index('IDX_subscription_plan_code', ['code'], { unique: true })
@Index('IDX_subscription_plan_active', ['isActive'])
@Index('IDX_subscription_plan_display_order', ['displayOrder'])
export class SubscriptionPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 100,
    unique: true,
  })
  code!: string;

  @Column({
    type: 'text',
    nullable: true,
    name: 'description',
  })
  description!: string | null;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'monthly_price',
  })
  monthlyPrice!: number;

  @Column({
    type: 'decimal',
    precision: 10,
    scale: 2,
    name: 'yearly_price',
  })
  yearlyPrice!: number;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'USD',
    name: 'currency',
  })
  currency!: string;

  @Column({
    type: 'int',
    name: 'max_users',
  })
  maxUsers!: number;

  @Column({
    type: 'int',
    name: 'max_tenders_per_month',
  })
  maxTendersPerMonth!: number;

  @Column({
    type: 'int',
    name: 'max_storage_gb',
  })
  maxStorageGb!: number;

  @Column({
    type: 'int',
    name: 'ai_credits_per_month',
  })
  aiCreditsPerMonth!: number;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'features',
  })
  features!: Record<string, unknown> | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @Column({
    type: 'int',
    default: 0,
    name: 'display_order',
  })
  displayOrder!: number;

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