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
import { OrganizationEntity } from './organization.entity';

@Entity('msme_certifications')
@Index('IDX_msme_certification_organization', ['organizationId'])
@Index('IDX_msme_certification_active', ['isActive'])
export class MsmeCertificationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
  })
  organizationId!: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'certificate_type',
  })
  certificateType!: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'certificate_number',
  })
  certificateNumber!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'issuing_authority',
  })
  issuingAuthority!: string;

  @Column({
    type: 'date',
    name: 'issued_at',
  })
  issuedAt!: string;

  @Column({
    type: 'date',
    nullable: true,
    name: 'expires_at',
  })
  expiresAt!: string | null;

  @Column({
    type: 'text',
    nullable: true,
    name: 'document_url',
  })
  documentUrl!: string | null;

  @Column({
    type: 'varchar',
    length: 500,
    nullable: true,
  })
  remarks!: string | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

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
