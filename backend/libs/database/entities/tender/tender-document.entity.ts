import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tender_documents')
export class TenderDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('uuid')
  organizationId!: string;

  @Column({ type: 'varchar', length: 255 })
  fileName!: string;

  @Column({ type: 'varchar', length: 100 })
  fileType!: string;

  @Column({ type: 'int' })
  fileSize!: number;

  @Column({ type: 'varchar', length: 50, default: 'PROCESSING' })
  extractionStatus!: string;

  @Column({ type: 'int', default: 0 })
  pageCount!: number;

  @Column({ type: 'text', nullable: true })
  extractedText!: string | null;

  // --- NEW P1.9 DOCUMENT INTELLIGENCE FIELDS ---
  @Column({ type: 'text', nullable: true })
  documentSummary!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  extractedMetadata!: object | null;

  @CreateDateColumn()
  uploadedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}