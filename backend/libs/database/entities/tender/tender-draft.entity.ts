import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Unique } from 'typeorm';

@Entity('tender_drafts')
@Unique('UQ_org_tender_doc_type', ['organizationId', 'tenderId', 'documentId', 'draftType'])
export class TenderDraftEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  organizationId!: string;

  @Column('uuid')
  tenderId!: string;

  @Column('uuid')
  documentId!: string;

  @Column({ type: 'varchar', length: 100 })
  draftType!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'jsonb', default: [] })
  usedSources!: string[];

  @Column({ type: 'jsonb', default: [] })
  missingInformation!: string[];

  @Column({ type: 'jsonb', default: [] })
  warnings!: string[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}