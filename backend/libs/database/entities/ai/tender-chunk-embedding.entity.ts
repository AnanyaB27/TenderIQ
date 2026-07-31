import { Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('tender_chunk_embeddings')
export class TenderChunkEmbeddingEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;
}