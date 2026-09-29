import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('tender_documents')
export class TenderDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', name: 'organization_id' })
  organizationId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'original_file_name',
    nullable: true,
  })
  fileName!: string;

  @Column({ type: 'varchar', length: 100, name: 'file_type' })
  fileType!: string;

  @Column({ type: 'bigint', name: 'file_size' })
  fileSize!: number;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'extraction_status',
    default: 'PROCESSING',
  })
  extractionStatus!: string;

  @Column({
    type: 'int',
    name: 'page_count',
    default: 0,
  })
  pageCount!: number;

  @Column({
    type: 'text',
    name: 'extracted_text',
    nullable: true,
  })
  extractedText!: string | null;

  @Column({
    type: 'text',
    name: 'documentSummary',
    nullable: true,
  })
  documentSummary!: string | null;

  @Column({
    type: 'jsonb',
    name: 'extractedMetadata',
    nullable: true,
  })
  extractedMetadata!: object | null;

  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  uploadedAt!: Date;

  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt!: Date;
}
