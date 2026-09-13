import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ColumnType } from 'typeorm';

@Entity('tender_document_chunks')
export class TenderDocumentChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id' })
  documentId: string;

  @Column({ name: 'chunk_hash', nullable: true })
  chunkHash: string;

  @Column({ type: 'int', name: 'sequence_number', default: 1 })
  sequenceNumber: number;

  @Column({ type: 'text' })
  text: string;

  @Column({ type: 'int', name: 'page_start', default: 1 })
  pageStart: number;

  @Column({ type: 'int', name: 'page_end', default: 1 })
  pageEnd: number;

  @Column({ name: 'section_heading', nullable: true })
  sectionHeading: string;

  @Column({ type: 'int', name: 'char_count', default: 0 })
  charCount: number;

  @Column({ type: 'vector' as unknown as ColumnType, length: 768, nullable: true })
  embedding: number[] | string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}