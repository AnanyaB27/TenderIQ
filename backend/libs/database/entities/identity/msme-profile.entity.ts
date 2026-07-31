import { Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { OrganizationEntity } from './organization.entity';

@Entity('msme_profiles')
export class MsmeProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToOne(() => OrganizationEntity, (organization) => organization.msmeProfile, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;
}