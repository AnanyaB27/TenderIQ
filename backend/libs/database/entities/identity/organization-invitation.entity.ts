import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('organization_invitations')
export class OrganizationInvitationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
