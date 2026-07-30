import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('organization_subscriptions')
export class OrganizationSubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
