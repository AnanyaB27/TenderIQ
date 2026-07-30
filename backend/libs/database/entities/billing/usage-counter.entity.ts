import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usage_counters')
export class UsageCounterEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
