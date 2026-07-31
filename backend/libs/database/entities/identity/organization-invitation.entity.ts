import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { OrganizationEntity } from './organization.entity';

@Entity('organization_invitations')
export class OrganizationInvitationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => OrganizationEntity, (organization) => organization.invitations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'organization_id' })
  organization!: OrganizationEntity;
}