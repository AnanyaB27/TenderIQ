import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('subscription_plans')
export class SubscriptionPlanEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
