import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { OrganizationEntity } from './organization.entity';

@Entity('msme_profiles')
export class MsmeProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'organization_id',
    unique: true,
  })
  organizationId!: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  businessCategory!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  industry!: string | null;

  @Column({
    type: 'varchar',
    length: 15,
    nullable: true,
    unique: true,
  })
  gstin!: string | null;

  @Column({
    type: 'varchar',
    length: 10,
    nullable: true,
    unique: true,
  })
  pan!: string | null;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
    name: 'udyam_number',
  })
  udyamNumber!: string | null;

  @Column({
    type: 'text',
    nullable: true,
  })
  address!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  city!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  state!: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  country!: string | null;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
    name: 'postal_code',
  })
  postalCode!: string | null;

  @Column({
    type: 'int',
    nullable: true,
    name: 'employee_count',
  })
  employeeCount!: number | null;

  @Column({
    type: 'numeric',
    precision: 15,
    scale: 2,
    nullable: true,
    name: 'annual_turnover',
  })
  annualTurnover!: number | null;

  @Column({
    type: 'int',
    nullable: true,
    name: 'year_established',
  })
  yearEstablished!: number | null;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_verified',
  })
  isVerified!: boolean;

  @OneToOne(
    () => OrganizationEntity,
    (organization) => organization.msmeProfile,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({ name: 'organization_id' })
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