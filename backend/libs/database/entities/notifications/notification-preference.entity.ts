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
import { UserEntity } from '../identity/user.entity';

export enum DigestFrequency {
  NEVER = 'NEVER',
  IMMEDIATE = 'IMMEDIATE',
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
}

@Entity('notification_preferences')
@Index('IDX_notification_preference_user', ['userId'], { unique: true })
@Index('IDX_notification_preference_digest', ['digestFrequency'])
@Index('IDX_notification_preference_email', ['emailEnabled'])
@Index('IDX_notification_preference_push', ['pushEnabled'])
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'user_id',
  })
  userId!: string;

  @Column({
    type: 'boolean',
    default: true,
    name: 'email_enabled',
  })
  emailEnabled!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'push_enabled',
  })
  pushEnabled!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'sms_enabled',
  })
  smsEnabled!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'tender_notifications',
  })
  tenderNotifications!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'bid_notifications',
  })
  bidNotifications!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'payment_notifications',
  })
  paymentNotifications!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'reminder_notifications',
  })
  reminderNotifications!: boolean;

  @Column({
    type: 'boolean',
    default: true,
    name: 'security_notifications',
  })
  securityNotifications!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'marketing_notifications',
  })
  marketingNotifications!: boolean;

  @Column({
    type: 'enum',
    enum: DigestFrequency,
    default: DigestFrequency.IMMEDIATE,
    name: 'digest_frequency',
  })
  digestFrequency!: DigestFrequency;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: true,
    name: 'quiet_hours_start',
  })
  quietHoursStart!: string | null;

  @Column({
    type: 'varchar',
    length: 5,
    nullable: true,
    name: 'quiet_hours_end',
  })
  quietHoursEnd!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    default: 'UTC',
    name: 'timezone',
  })
  timezone!: string;

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: UserEntity;

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