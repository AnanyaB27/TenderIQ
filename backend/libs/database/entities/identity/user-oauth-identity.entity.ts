import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { UserEntity } from './user.entity';

@Entity('user_oauth_identities')
@Unique('UQ_provider_providerId', ['provider', 'providerId'])
export class UserOauthIdentityEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'user_id' })
  userId!: string;

  @Column({ type: 'varchar', length: 50 })
  provider!: string;

  @Column({ type: 'varchar', length: 255, name: 'provider_id' })
  providerId!: string;

  @Column({ type: 'text', nullable: true, name: 'access_token' })
  accessToken!: string | null;

  @Column({ type: 'text', nullable: true, name: 'refresh_token' })
  refreshToken!: string | null;

  @Column({ type: 'jsonb', nullable: true, name: 'profile_data' })
  profileData!: Record<string, unknown> | null;

  @ManyToOne(() => UserEntity, (user) => user.oauthIdentities, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user!: UserEntity;

  @CreateDateColumn({ type: 'timestamp with time zone', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', name: 'updated_at' })
  updatedAt!: Date;
}