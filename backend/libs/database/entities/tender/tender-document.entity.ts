import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tender_documents')
export class TenderDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tender_id', nullable: true })
  tenderId: string;

  @Column({ name: 'organization_id', nullable: true })
  organizationId: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_type', default: 'application/pdf' })
  fileType: string;

  @Column({ name: 'file_size', type: 'int', default: 0 })
  fileSize: number;

  @Column({ name: 'page_count', type: 'int', default: 0 })
  pageCount: number;

  @Column({ name: 'extraction_status', default: 'PENDING' })
  extractionStatus: string;

  @Column({ name: 'extracted_text', type: 'text', nullable: true })
  extractedText: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}