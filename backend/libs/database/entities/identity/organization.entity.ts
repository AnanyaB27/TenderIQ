import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { OrganizationMemberEntity } from './organization-member.entity';
import { OrganizationInvitationEntity } from './organization-invitation.entity';
import { MsmeProfileEntity } from './msme-profile.entity';
import { MsmeCertificationEntity } from './msme-certification.entity';

@Entity('organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  name!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registrationNumber!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  taxId!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  logoUrl!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => OrganizationMemberEntity, (member) => member.organization)
  members!: OrganizationMemberEntity[];

  @OneToMany(
    () => OrganizationInvitationEntity,
    (invitation) => invitation.organization,
  )
  invitations!: OrganizationInvitationEntity[];

  @OneToOne(() => MsmeProfileEntity, (profile) => profile.organization)
  msmeProfile!: MsmeProfileEntity;

  @OneToMany(
    () => MsmeCertificationEntity,
    (certification) => certification.organization,
  )
  certifications!: MsmeCertificationEntity[];

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