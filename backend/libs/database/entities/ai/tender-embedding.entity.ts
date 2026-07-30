import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tender_embeddings')
export class TenderEmbeddingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}
