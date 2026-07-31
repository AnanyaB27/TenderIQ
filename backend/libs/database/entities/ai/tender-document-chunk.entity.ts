import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { TenderDocumentEntity } from '../tender/tender-document.entity';

@Entity('tender_document_chunks')
@Unique('UQ_tender_document_chunk_index', ['tenderDocumentId', 'chunkIndex'])
@Index('IDX_tender_document_chunk_document', ['tenderDocumentId'])
@Index('IDX_tender_document_chunk_index', ['chunkIndex'])
@Index('IDX_tender_document_chunk_page', ['pageNumber'])
@Index('IDX_tender_document_chunk_language', ['language'])
@Index('IDX_tender_document_chunk_checksum', ['checksum'])
export class TenderDocumentChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'tender_document_id',
  })
  tenderDocumentId!: string;

  @Column({
    type: 'int',
    name: 'chunk_index',
  })
  chunkIndex!: number;

  @Column({
    type: 'int',
    nullable: true,
    name: 'page_number',
  })
  pageNumber!: number | null;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'section_title',
  })
  sectionTitle!: string | null;

  @Column({
    type: 'text',
  })
  content!: string;

  @Column({
    type: 'int',
    name: 'token_count',
  })
  tokenCount!: number;

  @Column({
    type: 'int',
    name: 'character_count',
  })
  characterCount!: number;

  @Column({
    type: 'varchar',
    length: 64,
  })
  checksum!: string;

  @Column({
    type: 'varchar',
    length: 10,
    default: 'en',
  })
  language!: string;

  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'metadata',
  })
  metadata!: Record<string, unknown> | null;

  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active',
  })
  isActive!: boolean;

  @ManyToOne(() => TenderDocumentEntity, (tenderDocument) => tenderDocument.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'tender_document_id',
  })
  tenderDocument!: TenderDocumentEntity;

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