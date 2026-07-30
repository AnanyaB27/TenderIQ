import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tender_documents')
export class TenderDocumentEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
