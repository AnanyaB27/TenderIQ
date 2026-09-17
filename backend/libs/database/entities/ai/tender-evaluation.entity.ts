import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique, Index } from 'typeorm';

@Entity('tender_evaluations')
@Unique('UQ_org_tender_doc', ['organizationId', 'tenderId', 'documentId'])
@Index('IDX_org_tender', ['organizationId', 'tenderId'])
export class TenderEvaluationEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  organizationId!: string;

  @Column('uuid')
  tenderId!: string;

  @Column('uuid')
  documentId!: string;

  @Column({ type: 'int' })
  matchScore!: number;

  @Column({ type: 'varchar', length: 50 })
  eligibilityStatus!: string;

  @Column({ type: 'float', default: 0 })
  evidenceCoverage!: number;

  @Column({ type: 'text' })
  summary!: string;

  @Column({ type: 'jsonb', default: [] })
  gaps!: string[];

  @Column({ type: 'jsonb', default: [] })
  recommendations!: string[];

  @Column({ type: 'jsonb', default: [] })
  ruleResults!: object[];

  // --- NEW P1.11 FIELDS ---
  @Column({ type: 'jsonb', nullable: true })
  confidenceMetadata!: object | null;

  @Column({ type: 'jsonb', default: [] })
  riskFlags!: object[];
  // ------------------------

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}