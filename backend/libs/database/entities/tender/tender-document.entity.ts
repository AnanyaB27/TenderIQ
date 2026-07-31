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
import { TenderEntity } from './tender.entity';

export enum StorageProvider {
  LOCAL = 'local',
  S3 = 's3',
  AZURE = 'azure',
  GCS = 'gcs',
}

@Entity('tender_documents')
@Index('IDX_tender_document_tender', ['tenderId'])
@Index('IDX_tender_document_uploaded_by', ['uploadedByUserId'])
@Index('IDX_tender_document_processed', ['isProcessed'])
export class TenderDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    type: 'uuid',
    name: 'tender_id',
  })
  tenderId!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'original_file_name',
  })
  originalFileName!: string;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'stored_file_name',
  })
  storedFileName!: string;

  @Column({
    type: 'text',
    name: 'file_path',
  })
  filePath!: string;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'file_type',
  })
  fileType!: string;

  @Column({
    type: 'bigint',
    name: 'file_size',
  })
  fileSize!: number;

  @Column({
    type: 'varchar',
    length: 128,
    nullable: true,
  })
  checksum!: string | null;

  @Column({
    type: 'uuid',
    nullable: true,
    name: 'uploaded_by_user_id',
  })
  uploadedByUserId!: string | null;

  @Column({
    type: 'enum',
    enum: StorageProvider,
    default: StorageProvider.S3,
    name: 'storage_provider',
  })
  storageProvider!: StorageProvider;

  @Column({
    type: 'boolean',
    default: false,
    name: 'is_processed',
  })
  isProcessed!: boolean;

  @Column({
    type: 'timestamp with time zone',
    nullable: true,
    name: 'processed_at',
  })
  processedAt!: Date | null;

  @Column({
    type: 'boolean',
    default: true,
  })
  isActive!: boolean;

  @ManyToOne(() => TenderEntity, (tender) => tender.id, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({
    name: 'tender_id',
  })
  tender!: TenderEntity;

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