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
import { UserEntity } from '../identity/user.entity';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  TENDER = 'TENDER',
  BID = 'BID',
  PAYMENT = 'PAYMENT',
  REMINDER = 'REMINDER',
  SECURITY = 'SECURITY',
}

export enum NotificationPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

@Entity('notifications')
@Index('IDX_notification_organization', ['organizationId'])
@Index('IDX_notification_user', ['userId'])
@Index('IDX_notification_type', ['type'])
@Index('IDX_notification_priority', ['priority'])
@Index('IDX_notification_is_read', ['isRead'])
@Index('IDX_notification_created_at', ['createdAt'])
export class NotificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId!: string;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'user_id',
  })
  userId!: string | null;

  @Column({
    type: 'varchar',
    length: 255,
  })
  title!: string;

  @Column({
    type: 'text',
  })
  message!: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
    default: NotificationType.SYSTEM,
  })
  type!: NotificationType;

  @Column({
    type: 'enum',
    enum: NotificationPriority,
    default: NotificationPriority.LOW,
  })
  priority!: NotificationPriority;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_read',
  })
  isRead!: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'read_at',
  })
  readAt!: Date | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'action_url',
  })
  actionUrl!: string | null;

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

  @ManyToOne(() => UserEntity, (user) => user.id, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({
    name: 'user_id',
  })
  user!: UserEntity | null;

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