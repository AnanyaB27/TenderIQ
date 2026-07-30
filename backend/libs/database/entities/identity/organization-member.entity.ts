import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('organization_members')
export class OrganizationMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
