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

export enum SortDirection {
  ASC = 'ASC',
  DESC = 'DESC',
}

@Entity('saved_searches')
@Index('IDX_saved_search_organization', ['organizationId'])
@Index('IDX_saved_search_name', ['name'])
@Index('IDX_saved_search_default', ['isDefault'])
@Index('IDX_saved_search_notify', ['notifyOnNewMatches'])
@Index('IDX_saved_search_last_executed', ['lastExecutedAt'])
export class SavedSearchEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId!: string;

  @Column({
    type: 'varchar',
    length: 255,
  })
  name!: string;

  @Column({
    type: 'text',
    name: 'search_query',
  })
  searchQuery!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'filters',
  })
  filters!: Record<string, unknown> | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'sort_by',
    default: 'createdAt',
  })
  sortBy!: string;

  @Column({
    type: 'enum',
    enum: SortDirection,
    default: SortDirection.DESC,
    name: 'sort_direction',
  })
  sortDirection!: SortDirection;

  @Column({
    type: 'boolean',
    default: false,
    name: 'notify_on_new_matches',
  })
  notifyOnNewMatches!: boolean;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_default',
  })
  isDefault!: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'last_executed_at',
  })
  lastExecutedAt!: Date | null;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'organization_id',
  })
  organization!: OrganizationEntity;

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