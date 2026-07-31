import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Unique,
} from 'typeorm';

export enum AuthenticationType {
  NONE = 'none',
  API_KEY = 'api_key',
  OAUTH2 = 'oauth2',
  BASIC = 'basic',
  BEARER = 'bearer',
}

@Entity('tender_sources')
@Unique('UQ_tender_source_code', ['code'])
@Index('IDX_tender_source_active', ['isActive'])
@Index('IDX_tender_source_country', ['country'])
@Index('IDX_tender_source_auth_type', ['authenticationType'])
export class TenderSourceEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'varchar',
    length: 150,
  })
  name!: string;

  @Index()
  @Column({
    type: 'varchar',
    length: 50,
    unique: true,
  })
  code!: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description!: string | null;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: true,
    name: 'base_url',
  })
  baseUrl!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    default: 'India',
  })
  country!: string;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'supports_incremental_sync',
  })
  supportsIncrementalSync!: boolean;

  @Column({
    type: 'int',
    default: 360,
    name: 'sync_frequency_minutes',
  })
  syncFrequencyMinutes!: number;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'last_successful_sync_at',
  })
  lastSuccessfulSyncAt!: Date | null;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'last_failed_sync_at',
  })
  lastFailedSyncAt!: Date | null;

  @Column({
    type: 'int',
    nullable: true,
    name: 'last_sync_duration_ms',
  })
  lastSyncDurationMs!: number | null;

  @Column({
    type: 'enum',
    enum: AuthenticationType,
    default: AuthenticationType.NONE,
    name: 'authentication_type',
  })
  authenticationType!: AuthenticationType;

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