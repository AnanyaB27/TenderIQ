import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tender_document_chunks')
export class TenderDocumentChunkEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
