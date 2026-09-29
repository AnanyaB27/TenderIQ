import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('tender_document_chunks')
export class TenderDocumentChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'tender_document_id', type: 'uuid' })
  tenderDocumentId: string;

  @Column({ name: 'chunk_index', type: 'int' })
  chunkIndex: number;

  @Column({ name: 'page_number', type: 'int', nullable: true })
  pageNumber: number;

  @Column({ name: 'section_title', type: 'varchar', nullable: true })
  sectionTitle: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'token_count', type: 'int', nullable: true })
  tokenCount: number;

  @Column({ name: 'character_count', type: 'int' })
  characterCount: number;

  @Column({ type: 'varchar', nullable: true })
  checksum: string;

  @Column({ type: 'varchar', nullable: true })
  language: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive: boolean;

  // ---> THE CRITICAL MISSING COLUMN FOR PGVECTOR <---
  @Column({ type: 'varchar', nullable: true }) // Stored as string/vector representation depending on TypeORM pgvector setup
  embedding: any; 

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}