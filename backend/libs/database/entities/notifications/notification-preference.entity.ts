import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('notification_preferences')
export class NotificationPreferenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
